import 'style';
import { Component } from 'preact';

import GameBoard from '../gameBoard/GameBoard';
import Controls from '../controls/Controls';

import { newGeneration } from '../common/gameOfLife';
import { getLayout, getCellCoords, remapGeneration } from '../common/layout';


export function randomSeed(width, height, radius, rnd=0.8) {
  const coords = getCellCoords(width, height, radius);
  const seed = coords.map((d,i) => ({index: i, x: d.x, y: d.y, life: Math.random() > rnd}));

  return seed;
}

export default class App extends Component {
  constructor(props) {
    super(props);
    const radius = 12.5;
    const { nCols, nRows } = getLayout(props.width, props.height, radius);

    this.state = {
      width: props.width,
      height: props.height,
      radius,
      nCols,
      nRows,

      generation: randomSeed(props.width, props.height, radius),
      lifetime: 1600,
      animate: true,
    };
    this._interval = null;
    
    this.clearBoard = this.clearBoard.bind(this);
    this.setRadius = this.setRadius.bind(this);
    this.setRandom = this.setRandom.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleCell = this.toggleCell.bind(this);
    this.startAnimation = this.startAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.update = this.update.bind(this);
  }
  

  componentDidMount() {
    this.startAnimation();
  }


  componentWillReceiveProps(nextProps) {
    const { width, height } = nextProps;
    
    //update grid layout when width or height changes
    if ( width !== this.props.width || height !== this.props.height) {
      const { nCols, nRows } = getLayout(width, height, this.state.radius);
      this.setState({ nCols, nRows });
    }
  }


  clearBoard(evt) {
    // create new seed with random treshold above 1 (only dead cells)
    const generation = randomSeed(this.props.width, this.props.height, this.state.radius, 2);
    
    this.stopAnimation();
    this.setState({ generation, animate: false });
  }


  setRadius(inc) {
    const radius = this.state.radius + inc;
    const { nCols, nRows } = getLayout(this.props.width, this.props.height, radius);
    const coords = getCellCoords(this.props.width, this.props.height, radius)
    
    //reshape generation to match new grid size, then copy coords and index 
    const generation = remapGeneration(this.state.generation, this.state.nCols, nCols, nRows)
      .map((cell, i) => {
        return Object.assign({}, coords[i], { life: cell.life } )
      })
    
    this.setState({ nCols, nRows, radius, generation });
  }


  setRandom(evt) {
    const generation = randomSeed(this.props.width, this.props.height, this.state.radius);
    
    this.stopAnimation();
    this.setState({ generation, animate: false });
  }


  setSpeed(multi) {
    const lifetime = this.state.lifetime * multi;
    console.log(`new lifetime: ${lifetime} ms`);
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = setInterval(this.update, lifetime);
    }
    
    this.setState({ lifetime });
  }


  startAnimation() {
    this._interval = setInterval(this.update, this.state.lifetime);
    
    this.setState({ animate: true });
  }


  stopAnimation() {
    if(this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }

    this.setState({ animate: false });
  }


  toggleAnimation(evt) {
    evt.preventDefault();
    const animate = !this.state.animate;

    if (animate) {
      this.startAnimation();
    } else {
      this.stopAnimation();
    }
    
    this.setState({ animate });
  }


  toggleCell(cell) {
    const generation = this.state.generation.map(d => {
      if (d.index === cell.index) {
        return Object.assign({}, cell, { life: !cell.life });
      }
      return d;
    });

    this.setState({ generation });
  }


  update(evt) {
    const generation = newGeneration(this.state.generation, this.state.nCols);

    this.setState({ generation });
  }


  render(props, state) {
    return (
      <div>
        <GameBoard
          width={props.width}
          height={props.height}
          nCols={state.nCols}
          nRows={state.nRows}
          radius={state.radius}
          generation={state.generation}
          onCellClick={this.toggleCell}
          lifetime={state.lifetime}
          animate={state.animate}
        />
        <Controls
          animate={state.animate}
          onClear={this.clearBoard}
          onNext={this.update}
          onStartStop={this.toggleAnimation}
          onRandomize={this.setRandom}
          decreaseRadius={(evt) => this.setRadius(-1)}
          increaseRadius={(evt) => this.setRadius(1)}
          decreaseSpeed={(evt) => this.setSpeed(2)}
          increaseSpeed={(evt) => this.setSpeed(0.5)}  
        />
        <span>SVG icons via Font Awesome.</span>
      </div>
    );
  }
}
