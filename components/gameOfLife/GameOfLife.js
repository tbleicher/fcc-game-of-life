import 'style';
import { Component } from 'preact';

import GameBoard from '../gameBoard/GameBoard';
import Controls from '../controls/Controls';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      height: props.height,
      radius: 12.5,

      generation: [],
      lifetime: 1500,
      animate: true,
    };
    
    this.clearBoard = this.clearBoard.bind(this);
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.setRadius = this.setRadius.bind(this);
    this.setRandom = this.setRandom.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
  }
  
  clearBoard(evt) {
    evt.preventDefault();
    this.setState({ generation: [] });
  }

  setRadius(evt, inc) {
    evt.preventDefault();
    this.setState({ radius: this.state.radius+inc });
  }
  
  setRandom(evt) {
    evt.preventDefault();
    // generate random generation
    const nextGen = []; 
    this.setState({ generation: nextGen, animate: false });
  }

  setSpeed(evt, ms) {
    evt.preventDefault();
    this.setState({ lifetime: this.state.lifetime + ms });
  }

  toggleAnimation(evt) {
    evt.preventDefault();
    this.setState({ animate: !this.state.animate });
  }

  render(props, state) {
    return (
      <div>
        <GameBoard
          width={state.width}
          height={state.height}
          radius={state.radius}
          animate={state.animate}
          generation={state.generation}
        />
        <Controls
          animate={state.animate}
          onClear={this.clearBoard}
          onStartStop={this.toggleAnimation}
          onRandomize={this.setRandom}
          decreaseRadius={(evt) => this.setRadius(evt, -1)}
          increaseRadius={(evt) => this.setRadius(evt, 1)}
          decreaseSpeed={(evt) => this.setSpeed(evt, -500)}
          increaseSpeed={(evt) => this.setSpeed(evt, 500)}  
        />
        <span>SVG icons via Font Awesome.</span>
      </div>
    );
  }
}
