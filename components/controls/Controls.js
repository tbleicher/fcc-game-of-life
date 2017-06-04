const Controls = (props) => {
  const text = props.animate ? 'stop' : 'start';
  const btnClass = props.animate ? 'stop button' : 'start button';

  return (
    <div id="controls">
      <div class="space" />
      <div class="button" id={text} title={text} onClick={props.onStartStop} />
      <div class="button" id="next" title="clear board" onClick={props.onNext} />
      <div class="label button">generation:</div>
      <div class="button" id="clear" title="clear board" onClick={props.onClear} />
      <div class="button" id="random" title="randomize" onClick={props.onRandomize} />
      <div class="label button">speed:</div>
      <div class="button" id="slower" title="decrease speed" onClick={props.decreaseSpeed} />
      <div class="button" id="faster" title="increase speed" onClick={props.increaseSpeed} />
      <div class="label button">radius:</div>
      <div class="button" id="increase" title="increase cell radius" onClick={props.increaseRadius} />
      <div class="button" id="decrease" title="decrease cell radius" onClick={props.decreaseRadius} />

      <div class="space" />
    </div>
  );
}

export default Controls;