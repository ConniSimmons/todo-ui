import React from 'react';
import ListForm from './components/ListForm';
import './App.css';
import Context from './context';
import { uuid } from './helpers';
import Footer from './components/Footer';
import Header from './components/Header';


class App extends React.Component {
	constructor() {
		super();
		this.state = {
			tasks: [],
			taskList: [],
			editForm: '',
			listId: '',
			lists: [],
			listElements: [],
			listTasks: [],
			thingToDisplay: null,
		};
	}
	
	getTasks = async () => {
		//return await fetch('http://localhost:5555/api/tasks')
		return await fetch('https://helio-todo-api.herokuapp.com/api/tasks')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log('data from api: ', data);
				this.setState({
					tasks: data,
					taskList: data.map((item) => {
						return (
							<li key={item._id} id={item._id} onClick={this.updateTask}>
								{item.username || 'Unknown'}
							</li>
						);
					}),
					editForm: ''
				});
			})
			.catch();
	};

	getLists = () => {
		//fetch('http://localhost:5555/api/lists')
		fetch('https://helio-todo-api.herokuapp.com/api/lists')
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log('lists from api: ', data);
				this.setState({
					lists: data,
					listElements: data.map((item) => {
						return (
							<div key={item._id}>
								<li id={item._id} onClick={this.updateListDisplay}>
									{item.name || 'Unknown'}
									<br />
									{item.description}
								</li>
								<button className="deleteButton" id={item._id} onClick={this.deleteList}>
									Delete List
								</button>
								<br />
								<br />
							</div>
						);
					}),
					editForm: null,
					thingToDisplay: null
				});
			})
			.catch();
	};

	updateListDisplay = (event) => {
		event.preventDefault();
		let id = event.target.getAttribute('id');
		let list = this.state.lists.filter((list) => {
			return list._id === id;
		});
		// because this returns an array and i only want the first one...
		list = list[0];
		this.setState(
			{
				thingToDisplay: null
			},
			function() {
				this.setState({
					thingToDisplay: <ListForm key={uuid()} {...list} />
				});
			}
		);
	};
	deleteList = (event) => {
		console.log('deleting...');
		event.preventDefault();
		let id = event.target.getAttribute('id');
		console.log('id: ', id);
		let fetchOptions = {
			method: 'DELETE'
		};
		//fetch(`http://localhost:5555/api/lists/${id}`, fetchOptions)
		fetch(`https://helio-todo-api.herokuapp.com/api/lists/${id}`, fetchOptions)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log('response from api: ', data);
				this.getLists();
			})
			.catch();
	};

	componentDidMount() {
		this.getTasks();
		this.getLists();
	}

	doCreateListThing = (event) => {
		event.preventDefault();
		this.setState({
			thingToDisplay: <ListForm key={uuid()} />
		});
  };
  


	// This uses a single global context to share the state of the App compontent to everything else
	// I should be ashamed of myself for doing this
	render() {
		return (
			<div className="App">
				
				<Header />
				<Context.Provider value={{ ...this.state, getLists: this.getLists, getTasks: this.getTasks }}>
					<section className="controls">
						<section className="buttons">
							<button onClick={this.doCreateListThing}>Create List</button>
						</section>
						<section className="my-lists">
							<h2>My Lists</h2>
							<small>&nbsp;&nbsp;&nbsp;*click list for details*</small>
							<ul>{this.state.listElements}</ul>
						</section>
					</section>
					<section className="content"> {this.state.thingToDisplay}</section>
				</Context.Provider>
				<Footer />
			</div>
		);
	}
}

export default App;