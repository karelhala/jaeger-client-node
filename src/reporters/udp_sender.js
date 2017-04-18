// @flow
// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// import dgram from 'dgram';
// import fs from 'fs';
// import path from 'path';
import * as jaeger_types from '../gen-nodejs/jaeger_types';
import * as agent from '../gen-nodejs/Agent';
import {TBufferedTransport} from 'browser-thrift';

const HOST = 'localhost';
const PORT =  6832;
const UDP_PACKET_MAX_LENGTH = 65000;

export default class UDPSender {
    _host: string;
    _port: number;
    _maxPacketSize: number;
    _process: Process;
    _emitSpanBatchOverhead: number;
    _maxSpanBytes: number;
    _client: any;
    _spec: any;
    _byteBufferSize: number;
    _batch: Batch;
    _thriftProcessMessage: any;

    constructor(options: any = {}) {
        this._host = options.host || HOST;
        this._port = options.port || PORT;
        this._maxPacketSize = options.maxPacketSize || UDP_PACKET_MAX_LENGTH;
        this._byteBufferSize = 0;
        this._client = {
          send : () => console.log('send'),
          close : () => console.log('close'),
        };
    }

    _calcBatchSize(batch: Batch) {
        // return _thrift.Agent.emitBatch.argumentsMessageRW.byteLength(
        //     this._convertBatchToThriftMessage(this._batch)
        // ).length;
        return 0;
    }

    _calcSpanSize(span: any): number {
        // return jaeger_types.Span.read(new jaeger_types.Span(span)).length;
        return 0;
    }

    setProcess(process: Process): void {
        // This function is only called once during reporter construction, and thus will
        // give us the length of the batch before any spans have been added to the span
        // list in batch.
        this._process = process;
        this._batch = {
            'process': this._process,
            'spans': []
        };

        let tagMessages = [];
        for (let j = 0; j < this._batch.process.tags.length; j++) {
            let tag = this._batch.process.tags[j];
            tagMessages.push(new jaeger_types.Tag(tag));
        }

        this._thriftProcessMessage = new jaeger_types.Process({
            serviceName: this._batch.process.serviceName,
            tags: tagMessages
        });
        this._emitSpanBatchOverhead = this._calcBatchSize(this._batch);
        this._maxSpanBytes = this._maxPacketSize - this._emitSpanBatchOverhead;
    }

    append(span: any): SenderResponse {
        let spanSize: number = this._calcSpanSize(span);
        if (spanSize > this._maxSpanBytes) {
            return { err: true, numSpans: 1 };
        }

        this._byteBufferSize += spanSize;
        if (this._byteBufferSize <= this._maxSpanBytes) {
            this._batch.spans.push(span);
            if (this._byteBufferSize < this._maxSpanBytes) {
                return {err: false, numSpans: 0};
            }
            return this.flush();
        }

        let flushResponse: SenderResponse = this.flush();
        this._batch.spans.push(span);
        this._byteBufferSize = spanSize;
        return flushResponse;
    }

    flush(): SenderResponse {
        let numSpans: number = this._batch.spans.length;
        if (numSpans == 0) {
            return {err: false, numSpans: 0}
        }

        let bufferLen = this._byteBufferSize + this._emitSpanBatchOverhead;
        let thriftBuffer = new Buffer(bufferLen);
        let bufferResult = 0;

        if (bufferResult.err) {
            console.log('err', bufferResult.err);
            return {err: true, numSpans: numSpans};
        }

        // TODO(oibe) use callback in send
        this._client.send(thriftBuffer, 0, thriftBuffer.length, this._port, this._host);
        this._reset();

        return {err: false, numSpans: numSpans};
    }

    _convertBatchToThriftMessage() {
        let spanMessages = [];
        for (let i = 0; i < this._batch.spans.length; i++) {
            let span = this._batch.spans[i];
            spanMessages.push(new jaeger_types.Span(span))
        }

        return {};
    }

    _reset() {
        this._batch.spans = [];
        this._byteBufferSize = 0;
    }

    close(): void {
        this._client.close();
    }
}
