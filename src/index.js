import Configuration from './configuration';

module.exports = {
    initTracer: Configuration.initTracer
};

const tracerConfig = {
          serviceName: 'bonjour',
          reporter: {
            flushIntervalMs: 1000,
            agentHost: 'test',
            agentPort: 6832,
            logSpans: true
          },
      sampler: {
            type: 'const',
                param: 1
          }
    };
const jaegerTracer = Configuration.initTracer(tracerConfig);
jaegerTracer.startSpan('dddd').finish();
console.log(jaegerTracer);