//
// Autogenerated by Thrift Compiler (0.9.1)
//
// DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
//
var Thrift = require('browser-thrift').Thrift;

var ttypes = require('./jaeger_types');
//HELPER FUNCTIONS AND STRUCTURES

var Agent_emitBatch_args = function(args) {
  this.batch = null;
  if (args) {
    if (args.batch !== undefined) {
      this.batch = args.batch;
    }
  }
};
Agent_emitBatch_args.prototype = {};
Agent_emitBatch_args.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    switch (fid)
    {
      case 1:
      if (ftype == Thrift.Type.STRUCT) {
        this.batch = new ttypes.Batch();
        this.batch.read(input);
      } else {
        input.skip(ftype);
      }
      break;
      case 0:
        input.skip(ftype);
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Agent_emitBatch_args.prototype.write = function(output) {
  output.writeStructBegin('Agent_emitBatch_args');
  if (this.batch !== null && this.batch !== undefined) {
    output.writeFieldBegin('batch', Thrift.Type.STRUCT, 1);
    this.batch.write(output);
    output.writeFieldEnd();
  }
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var Agent_emitBatch_result = function(args) {
};
Agent_emitBatch_result.prototype = {};
Agent_emitBatch_result.prototype.read = function(input) {
  input.readStructBegin();
  while (true)
  {
    var ret = input.readFieldBegin();
    var fname = ret.fname;
    var ftype = ret.ftype;
    var fid = ret.fid;
    if (ftype == Thrift.Type.STOP) {
      break;
    }
    input.skip(ftype);
    input.readFieldEnd();
  }
  input.readStructEnd();
  return;
};

Agent_emitBatch_result.prototype.write = function(output) {
  output.writeStructBegin('Agent_emitBatch_result');
  output.writeFieldStop();
  output.writeStructEnd();
  return;
};

var AgentClient = exports.Client = function(output, pClass) {
    this.output = output;
    this.pClass = pClass;
    this.seqid = 0;
    this._reqs = {};
};
AgentClient.prototype = {};
AgentClient.prototype.emitBatch = function(batch, callback) {
  this.seqid += 1;
  this._reqs[this.seqid] = callback;
  this.send_emitBatch(batch);
};

AgentClient.prototype.send_emitBatch = function(batch) {
  var output = new this.pClass(this.output);
  output.writeMessageBegin('emitBatch', Thrift.MessageType.CALL, this.seqid);
  var args = new Agent_emitBatch_args();
  args.batch = batch;
  args.write(output);
  output.writeMessageEnd();
  return this.output.flush();
};
var AgentProcessor = exports.Processor = function(handler) {
  this._handler = handler
}
AgentProcessor.prototype.process = function(input, output) {
  var r = input.readMessageBegin();
  if (this['process_' + r.fname]) {
    return this['process_' + r.fname].call(this, r.rseqid, input, output);
  } else {
    input.skip(Thrift.Type.STRUCT);
    input.readMessageEnd();
    var x = new Thrift.TApplicationException(Thrift.TApplicationExceptionType.UNKNOWN_METHOD, 'Unknown function ' + r.fname);
    output.writeMessageBegin(r.fname, Thrift.MessageType.Exception, r.rseqid);
    x.write(output);
    output.writeMessageEnd();
    output.flush();
  }
}

AgentProcessor.prototype.process_emitBatch = function(seqid, input, output) {
  var args = new Agent_emitBatch_args();
  args.read(input);
  input.readMessageEnd();
  this._handler.emitBatch(args.batch)
}
