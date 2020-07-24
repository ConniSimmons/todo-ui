import React from 'react';
import Context from '../context';
import {uuid} from '../helpers';
import TaskForm from './TaskForm';
import { Form } from 'react-bootstrap';

Array.prototype.findById = function(id)
{
    console.log('filter array by id: ', id);
    console.log('this arg: ', this);
    let filtered = this.filter((item) =>
    {
        return item._id === id;
    });
    if (filtered.length > 1)
    {
        console.log('Why does life hate met?');
    }
    return filtered[0];
}
export default class TaskList extends React.Component {
    constructor(props)
    {
        super(props);
        this.state = {
            tasks: [],
            taskElements: null,
        }
    }
    renderTasks = () =>
    {

        console.log('getting tasks...');
        this.setState({
            tasks: this.context.tasks.filter((task) =>
            {
                return task.listId === this.props.listId;
            })
        }, function()
        {
            this.setState({
                taskElements: this.state.tasks.map((task) =>
                {
                    return (
                        <div>
                            <br />
                            <br />                            
                                <li key={uuid()}>
                                    <span>{task.name}</span>:
                                     <span>{task.description}</span>
                                     <br />
                                     <span>Due date: {task.due}
                                     </span>
                                     <br />
                                     {this.statusBox(task)}
                                     </li>
                                    <button
                                        className="deleteButton"
                                        id={task._id} 
                                        onClick={this.deleteList}>
                                            Delete Task
							        </button>
                                    <br />
                                    <br />
                        </div>
                    )
                })
            }, function()
            {
                console.log('state after update: ', this.state);
            })
        })

    }
    deleteTask = (event) => {
		console.log('deleting...');
		event.preventDefault();
		let id = event.target.getAttribute('id');
		console.log('id: ', id);
		let fetchOptions = {
			method: 'DELETE'
		};
		fetch(`http://localhost:5555/api/tasks/${id}`, fetchOptions)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log('response from api: ', data);
				this.getTasks();
			})
			.catch();
	};
    statusBox = (task) =>
    {
        
        return (<Form.Check key={uuid()} id={task._id} type='checkbox' label="Task Complete" checked={(task.status === 'complete')} onChange={this.handleCheck} />)
    }
    handleCheck = (event) =>
    {
        // do not prevent default here because I actually want it to happen as normal
        let taskId = event.target.getAttribute('id');
        let task = this.state.tasks.findById(taskId);
        let fetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({status: task.status === 'complete' ? 'pending' : 'complete' })
        }
        fetch(`http://localhost:5555/api/tasks/${taskId}`, fetchOptions)
        .then((response) => { return response.json()})
        .then((data) =>
        {
            //check to see if it actually updated...
            console.log('update data: ', data);
            this.context.getTasks()
            .then((whatever) =>
            {
                return this.renderTasks();
            })
            .catch((err) =>
            {
                console.log('This will never error....so.....');
            })

            // why won't my checkbox re-render?!?!?
        })
        .catch((err) =>
        {
            console.log('failed to update: ', err);
        })
    }
    componentDidMount()
    {
        this.renderTasks();
    }
    render(){
        return (
            <section className="taskList">
                <ul>
                    <br />
                <li key={uuid()}><TaskForm listId={this.props.listId} /></li>
                    {this.state.taskElements}
                    
                </ul>
               
            </section>
        )
    }
}
TaskList.contextType = Context;