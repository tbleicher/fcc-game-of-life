import { Component } from 'preact';
import { select } from 'd3-selection';

//this import 'injects' the transition() function into d3-selection
import 'd3-transition';

import { getLayout, getCellCoords, getGridCoords } from '../common/layout';

//define constants as element IDs for cell wrapper and filter
const CELL_WRAPPER_ID = "cellWrapper";
const GOOEY_FILTER_ID = "gooeyCodeFilter";


//append blur filter to SVG defs element
//filter code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
export function addSVGFilter(svg, animate) {
  //disable blur unless animation is starting/ongoing
  const stdDev = animate ? "9" : "0";
  
  const defs = svg.append("defs");
  const filter = defs.append("filter")
    .attr("id", GOOEY_FILTER_ID);

  filter.append("feGaussianBlur")
    .attr("id", "blurFilter")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", "9")
    //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
    .attr("color-interpolation-filters", "sRGB")
    .attr("result", "blur");

  filter.append("feColorMatrix")
    .attr("in", "blur")
    .attr("mode", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
    .attr("result", "gooey");
}


//draw grid markers as small dots offset by the cell radius in x and y
export function drawGrid(svg, width, height, radius) {
  const coords = getGridCoords(width, height, radius);
  
  const gridWrapper = svg.append("g")
    .attr('transform', `translate(${width/2},${height/2})`);
    
  var gridDots = gridWrapper.selectAll(".grid")
    .data(coords)
    .enter()
      .append("circle")
      .attr("class", "grid")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 2)
      .style("fill", "#ddd")
      .style("opacity", 1);
}


//draw cells as SVG circles within group that has blur filter applied to it
export function drawCells(svg, width, height, radius, data, callback) {
  //Create group and translate it to center of board.
  //Adding the blur filter here creates an immediate transition
  //to blured cells when the animation starts.
  const wrapper = svg.append("g")
    .attr("id", CELL_WRAPPER_ID)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .style("filter", "url(#gooeyCodeFilter)");
  
  //add cells on a grid pattern with onclick callback to select/deselect cell
  //no transition here because this is a static board to edit the cell state
  const cells = wrapper.selectAll(".cell")
    .data(data, d => d.index) //use index of cells to create data bind 
    .enter()
    .append("circle")
    .attr("class", "cell")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", radius)
    .style("fill", d => (d.life) ? "#090" : "#eee")
    .style("opacity", 1)
    .on('click', d => callback(d));
}


//use D3 data binding and transition to update cell state 
export function updateCells(base, data, radius, lifetime, callback) {
  const svg = select(base);

  //select the cell wrapper group by ID to get old cells/circles
  const cells = svg.select("#" + CELL_WRAPPER_ID)
    .selectAll(".cell")
    .data(data, d => d.index)
  
  //create new cells with 'grow' animation
  cells.enter()
    .append("circle")
    .attr("class", "cell")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .on('click', d => callback(d))
    .style("fill", d => (d.life) ? "#090" : "#eee")
    .style("opacity", 1)
    .transition("grow")
      .duration(lifetime)
      .attr("r", radius);

  //remove cells that have died with color change and shrinking
  cells.exit()
    .transition("brown")
      .duration(lifetime / 2)
      .style("fill", "#970")
    .transition("shrink")
      .duration(lifetime / 2)
      .attr("r", 0)
    .remove();
}


//
// GameBoard component
//
export default class GameBoard extends Component {
  constructor(props) {
    super(props);

    this.clear = this.clear.bind(this);
    this.draw = this.draw.bind(this);
  }
  
  
  //remove g elements (and all circles) after render()
  clear() {
    const svg = select(this.base);
    svg.selectAll("g").remove();
  }

  
  //redraw SVG board after render()
  draw() {
    const { width, height, radius, animate, generation, onCellClick } = this.props;
    const svg = select(this.base);
    
    //create blur filter the first time the board is drawn
    if (!document.getElementById(GOOEY_FILTER_ID)) {
      addSVGFilter(svg, animate);
    }

    //set filter stdDev according to radius; disable if not animating
    const stdDev = animate ? radius * 0.75 : 0;
    document.getElementById("blurFilter").setAttribute("stdDeviation", `${stdDev}`);
    
    //create grid markers
    drawGrid(svg, width, height, radius);

    //remove dead cells if animation is ongoing
    const data = animate ? generation.filter(cell => cell.life) : generation.slice();
    drawCells(svg, width, height, radius, data, onCellClick);
  }

  
  //perform post-update action (redraw) after mount
  componentDidMount() {
    this.componentDidUpdate();
  }

  
  //remove and redraw grid and cells after render()
  componentDidUpdate() {
    this.clear();
    this.draw();
  }

  
  //check layout vs data-only changes
  shouldComponentUpdate(nextProps, nextState) {
    //if animate flag is not set, redraw whole board
    if (!nextProps.animate) {
      return true;
    }
    
    //Render the first 'frame' of animation via Preact.render()
    //to avoid flash of brown when all (clickable) dead cells
    //are removed in D3 transition. 
    if (nextProps.animate !== this.props.animate) {
      return true;
    }

    //require redraw if layout related props have changed
    let requireUpdate = false;
    ['width', 'height', 'nCols', 'nRows', 'radius', 'onCellClick'].forEach(o => {
      if (nextProps[o] !== this.props[o]) {
        requireUpdate = true;
        //console.log(`layout change: ${o}=${nextProps[o]} (was: ${this.props[o]})`);
      }
    });

    if (requireUpdate) {
      return true;
    }
    
    //All changes that require render() have been checked.
    //Now update board state via D3 enter/exit transition.
    const { generation, radius, lifetime, onCellClick } = nextProps;
    const data = generation.filter(cell => cell.life);
    updateCells(this.base, data, radius, lifetime, onCellClick);

    //Return false to signal that render() should not be called.
    return false;
  }


  //only creates the base SVG element
  render(props, state) {
    return (
      <svg width={props.width} height={props.height}>
      </svg>
    );
  }
}