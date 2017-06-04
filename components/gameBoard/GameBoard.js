import { Component } from 'preact';
import { select } from 'd3-selection';
import 'd3-transition';

import { getLayout, getCellCoords, getGridCoords } from '../common/layout';

const CELL_WRAPPER_ID = "cellWrapper";
const GOOEY_FILTER_ID = "gooeyCodeFilter";


export function addSVGFilter(svg, animate) {
  //SVG filter for the gooey effect
  //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
  const stdDev = animate ? "9" : "0";
  const defs = svg.append("defs");

  const filter = defs.append("filter")
    .attr("id", GOOEY_FILTER_ID);

  filter.append("feGaussianBlur")
    .attr("id", "blurFilter")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", stdDev)
    //to fix safari: http://stackoverflow.com/questions/24295043/svg-gaussian-blur-in-safari-unexpectedly-lightens-image
    .attr("color-interpolation-filters", "sRGB")
    .attr("result", "blur");

  filter.append("feColorMatrix")
    .attr("in", "blur")
    .attr("mode", "matrix")
    .attr("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
    .attr("result", "gooey");
}


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
      .style("fill", "#aaa")
      .style("opacity", 1);
}


export function drawCells(svg, width, height, radius, data, callback) {
  const wrapper = svg.append("g")
    .attr("id", CELL_WRAPPER_ID)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .style("filter", "url(#gooeyCodeFilter)");

  const cells = wrapper.selectAll(".cell")
    .data(data, d => d.index)
    .enter()
    .append("circle")
    .attr("class", "cell")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", radius)
    .style("fill", d => (d.life) ? "#090" : "#ddd")
    .style("opacity", 1)
    .on('click', d => callback(d));
}


//use D3 data binding to update cell state in existing grid
export function updateCells(base, data, radius, lifetime, callback) {
  const svg = select(base);
  const wrapper = svg.select("#" + CELL_WRAPPER_ID);

  const cells = wrapper
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
    .style("fill", d => (d.life) ? "#090" : "#ddd")
    .style("opacity", 1)
    .transition("grow")
      .duration(lifetime/2)
      .attr("r", radius);

  //remove cells that have died with color change and shrinking
  cells.exit()
    .transition("brown")
      .duration(lifetime / 6)
      .style("fill", "#970")
    .transition("shrink")
      .duration(lifetime / 3)
      .attr("r", 0)
    .remove();
}


export default class GameBoard extends Component {
  constructor(props) {
    super(props);

    this.clear = this.clear.bind(this);
    this.draw = this.draw.bind(this);
  }
  
  
  //remove g elements (and all circles)
  clear() {
    const svg = select(this.base);
    svg.selectAll("g").remove();
  }


  draw() {
    const { width, height, radius, animate, generation, onCellClick } = this.props;
    const svg = select(this.base);

    // only draw life cells if animation is ongoing
    let data = generation.slice();
    if (animate) {
      data = data.filter(d => d.life);
    }
    
    //create blur filter the first time the board is drawn
    if (!document.getElementById(GOOEY_FILTER_ID)) {
      addSVGFilter(svg, animate);
    }

    drawGrid(svg, width, height, radius);
    drawCells(svg, width, height, radius, data, onCellClick);
  }


  componentDidMount() {
    this.componentDidUpdate();
  }


  componentDidUpdate() {
    this.clear();
    this.draw();
  }


  componentWillReceiveProps(nextProps) {
    //disable blur filter when board is not animating
    if (nextProps.animate !== this.props.animate) {
      const stdDev = nextProps.animate ? 9 : 0;
      document.getElementById("blurFilter").setAttribute("stdDeviation", `${stdDev}`);
    }
  }

  
  //TODO: check layout vs data-only changes
  shouldComponentUpdate(nextProps, nextState) {
    //if animate flag is not set, redraw whole board
    if (!nextProps.animate) {
      return true;
    }

    //require redraw if layout related props have changed
    let requireUpdate = false;
    ['width', 'height', 'nCols', 'nRows', 'radius', 'onCellClick'].forEach(o => {
      if (nextProps[o] !== this.props[o]) {
        console.log(`layout change: ${o}=${nextProps[o]} (was: ${this.props[o]})`);
        requireUpdate = true;
      }
    });

    if (requireUpdate) {
      return true;
    }

    //perform cell state update via D3 animation
    const { generation, radius, lifetime, onCellClick } = nextProps;
    const data = generation.filter(cell => cell.life);
    updateCells(this.base, data, radius, lifetime, onCellClick);

    //return false to signal that render() should not be called
    return false;
  }


  //render only creates the base SVG element
  render(props, state) {
    return (
      <svg width={props.width} height={props.height}>
      </svg>
    );
  }
}