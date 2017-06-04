const Controls = (props) => {
  const text = props.animate ? 'stop' : 'start';
  const btnClass = props.animate ? 'stop button' : 'start button';

  return (
    <div id="controls">
      <div class="space" />

      <div class="button" id={text} title={text} onClick={props.onStartStop} />
      <div class="button" id="next" title="next generation" onClick={props.onNext} />

      <div class="label">
        <div class="title">generation:</div>
        <div class="value">{props.generationCount}</div>
      </div>
      <div class="button" id="clear" title="clear board" onClick={props.onClear} />
      <div class="button" id="random" title="randomize" onClick={props.onRandomize} />
      
      <div class="label">
        <div class="title">lifetime:</div>
        <div class="value">{props.lifetime} ms</div>
      </div>
      <div class="button" id="slower" title="increase lifetime" onClick={props.increaseLifetime} />
      <div class="button" id="faster" title="decrease lifetime" onClick={props.decreaseLifetime} />
      
      <div class="label">
        <div class="title">radius:</div>
        <div class="value">{props.radius} px</div>
      </div>
      <div class="button" id="increase" title="increase cell radius" onClick={props.increaseRadius} />
      <div class="button" id="decrease" title="decrease cell radius" onClick={props.decreaseRadius} />

      <div class="space" />
    </div>
  );
}

export default Controls;