import './style';
import { Component } from 'preact';

import GameOfLife from './components/gameOfLife/GameOfLife';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: 600,
			height: 400
		};
	}

	render(props, state) {
		return (
			<div>
				<h1>Game of Life</h1>
				<GameOfLife 
				  width={state.width}
					height={state.height}
				/>
			</div>
		);
	}
}
