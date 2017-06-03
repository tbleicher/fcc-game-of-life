import { Component } from 'preact';
import { select } from 'd3-selection';


export function getLayout(width, height, radius) {
	const padding = radius;
	const nCols = Math.floor((width - padding) / (2 * radius));
	const nRows = Math.floor((height - padding) / (2 * radius));
	const offsetX = (width - nCols * 2 * radius) / 2;
	const offsetY = (height - nRows * 2 * radius) / 2;

	return { nCols, nRows, offsetX, offsetY };
}

export function getCellCoords(width, height, radius) {
	return getGridCoords(width, height, radius, 0);
}

export function getGridCoords(width, height, radius, gridOffset=1) {
	const { nCols, nRows, offsetX, offsetY } = getLayout(width, height, radius);
  let dX = offsetX;
	let dY = offsetY;
	
	// adjust grid offset for grid or cell position
	if (gridOffset === 0) {
		dX = offsetX + radius;
		dY = offsetY + radius;
	}

	return Array
	  .apply(null, { length: (nCols+gridOffset) * (nRows+gridOffset) })
	  .map(Number.call, Number)
		.map(i => {
			return {
				x: (i % (nCols+gridOffset)) * 2 * radius - width / 2 + dX,
				y: Math.floor(i / (nCols+gridOffset)) * 2 * radius - height / 2 + dY
			}
		});
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

export function drawCells(svg, width, height, radius) {
	const coords = getCellCoords(width, height, radius);

	const wrapper = svg.append("g")
		.attr('transform', `translate(${width / 2},${height / 2})`);

	var cells = wrapper.selectAll(".cell")
		.data(coords)
		.enter()
		.append("circle")
		.attr("class", "cell")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.attr("r", radius)
		.style("fill", "#090")
		.style("opacity", 1);
}

export default class GameBoard extends Component {
	constructor(props) {
		super(props);

    this.clear = this.clear.bind(this);
		this.draw = this.draw.bind(this);
	}
  
	clear() {
		const svg = select(this.base);
		svg.selectAll("g").remove();
	}

	draw() {
		const { width, height, radius, animate, random } = this.props;
		const svg = select(this.base);

		drawGrid(svg, width, height, radius);
		drawCells(svg, width, height, radius);
	}

	componentDidMount() {
    this.componentDidUpdate();
	}

	componentDidUpdate() {
		this.clear();
		this.draw();
	}
  
	shouldComponentUpdate(nextProps, nextState) {
		const old = getLayout(this.props.width, this.props.height, this.props.radius);
		const next = getLayout(nextProps.width, nextProps.height, nextProps.radius);
		if (old.nCols !== next.nCols || old.nRows !== next.nRows) {
			console.log(`update required: old:(${old.nCols},${old.nRows}) next:(${next.nCols},${next.nRows})`);
		  
	  }
		console.log(`next: radius=${nextProps.radius}  (old=${this.props.radius})`)
		return true;
	}

  render(props, state) {
		return (
			<svg width={props.width} height={props.height}>
			</svg>
		);
	}
}