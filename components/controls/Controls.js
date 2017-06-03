const Controls = (props) => {
  const text = props.animate ? 'stop' : 'start';
  const btnClass = props.animate ? 'stop button' : 'start button';

  return (
    <div id="controls">
      <div class="space" />
      <div class={btnClass} onClick={props.onStartStop}>{text}</div>
      <div class="button" onClick={props.onClear}>clear</div>
      <div class="inactive button">radius:</div>
      <div class="button" onClick={props.increaseRadius}>+</div>
      <div class="button" onClick={props.decreaseRadius}>-</div>
      <div class="space" />
    </div>
  );
}

export default Controls;