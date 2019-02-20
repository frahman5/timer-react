// Job: Be a Container for EditableTimerList and ToggleableTImerForm
class TimersDashboard extends React.Component {
    state = { timers: [], };
    componentDidMount() {
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer, 5000);
    }
    loadTimersFromServer = () => {
        client.getTimers((serverTimers) => {
            this.setState({timers: serverTimers});
        });
    };
    handleCreateFormSubmit = (timer) => { this.createTimer(timer); };
    createTimer = (timer) => {
        const t = helpers.newTimer(timer);
        this.setState({
            timers: this.state.timers.concat(t),
        });
        client.createTimer(
            {
                id: t.id,
                title: t.title,
                project: t.project,
            }
        );
    };
    handleTimerUpdate = (attrs) => { 
        this.updateTimers(attrs); 
        client.updateTimer({
            id: attrs.id, 
            title: attrs.title,
            project: attrs.project,
        })
    };
    updateTimers = (attrs) => {
        const newtimers = this.state.timers.map((timer) => {
            if (timer.id == attrs.id) {
                return Object.assign({}, timer, {
                    title: attrs.title,
                    project: attrs.project,
                });
            } else {
                return timer;
            }
        });
        this.setState( {timers: newtimers} );
        // client.updateTimers({id: attrs.id, title: attrs.title, project: attrs.project});
    };
    handleTrashClick = (id) => { this.deleteTimer(id); };
    deleteTimer = (id) => {
        const newtimers = this.state.timers.filter((timer) => {
            return (timer.id != id);
        })
        this.setState({timers: newtimers});
        client.deleteTimer({id: id});
    };
    handleStartClick = (id) => { this.startTimer(id); };
    handleStopClick = (id) => { this.stopTimer(id); };
    startTimer = (id) => {
        const now = Date.now();

        this.setState({timers: this.state.timers.map((timer) => {
            if (timer.id === id) {
                return Object.assign({}, timer, {runningSince: now});
            } else {
                return timer;
            }
        })});

        client.startTimer( {id: id, start: now,});
    };
    stopTimer = (id) => {
        const now = Date.now();
        this.setState({timers: this.state.timers.map((timer) => {
            if (timer.id === id) {
                const lastElapsed = Date.now() - timer.runningSince;
                const newElapsed = timer.elapsed + lastElapsed
                return Object.assign({}, timer, {
                    elapsed: newElapsed,
                    runningSince: null,
                });
            } else {
                return timer;
            }
        })});
        client.stopTimer( {id: id, stop: now,});
    };
    render() {
        return(
            <div className="ui three column centered grid">
                <div className="column">
                    <EditableTimerList 
                        timers={this.state.timers}
                        onEditableTimerUpdate={this.handleTimerUpdate}
                        onTrashClick={this.handleTrashClick}
                        onStopClick={this.handleStopClick}
                        onStartClick={this.handleStartClick}
                    />
                    <ToggleableTimerForm 
                        isOpen={false}
                        onFormSubmit={this.handleCreateFormSubmit}
                    />
                </div>
            </div>

        );
    }
}

// // Job: Display the Editable Timers
class EditableTimerList extends React.Component {
    render() {
        const timers = this.props.timers.map((timer) => (
                <EditableTimer 
                    key={timer.id}
                    id={timer.id}
                    title={timer.title}
                    project={timer.project}
                    elapsed={timer.elapsed}
                    runningSince={timer.runningSince}
                    editFormOpen={false}
                    onTimerUpdate={this.props.onEditableTimerUpdate}
                    onTrashClick={this.props.onTrashClick}
                    onStopClick={this.props.onStopClick}
                    onStartClick={this.props.onStartClick}
                />
            ));
        return ( <div id="timers"> {timers} </div>);
    }
}

// Job: Display either a timer or a timer form
class EditableTimer extends React.Component {
    state = {
        editFormOpen: false,
    };
    handleEditClick = () => {
        this.setState( {editFormOpen: true} );
    };
    handleFormCancel = () => {
        this.setState( {editFormOpen: false} );
    };
    handleFormSubmit = (timer) => {
        this.props.onTimerUpdate(timer);
        this.closeForm();
    };
    closeForm = () => {
        this.setState( {editFormOpen: false} );
    }
    render() {
        if (this.state.editFormOpen) {
            return (
                <TimerForm 
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormCancel={this.handleFormCancel}
                    onFormSubmit={this.handleFormSubmit}
                />
            );
        } else {
            return (
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onTrashClick={this.props.onTrashClick}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick}
                />
            );
        }
    }
}

// Job: Display a timer form
class TimerForm extends React.Component {
    state = {
        title: this.props.title || '', 
        project: this.props.project || '',
    };
    handleTitleChange = (e) => { this.setState( {title: e.target.value} ) };
    handleProjectChange = (e) => { this.setState( {project: e.target.value} ) };
    handleSubmit = () => {
        this.props.onFormSubmit({
            id: this.props.id,
            title: this.state.title,
            project: this.state.project,
        });
    };
    render() {
        console.log("The props id is: " + this.props.id);
        const submitText = this.props.id ? 'Update' : 'Create';
        return (
            <div className='ui centered card'>
                <div className='content'>
                    <div className='ui form'>
                        <div className='field'>
                            <label>Title</label>
                            <input 
                                type='text' 
                                value={this.state.title}
                                onChange={this.handleTitleChange}
                            />
                        </div>
                        <div className='field'>
                            <label>Project</label>
                            <input 
                                type='text' 
                                value={this.state.project}
                                onChange={this.handleProjectChange}
                            />
                        </div>
                        <div className='ui two bottom attached buttons'>
                            <button 
                                className='ui basic blue button'
                                onClick={this.handleSubmit}
                            >
                                {submitText}
                            </button>
                            <button 
                                className='ui basic red button'
                                onClick={this.props.onFormCancel}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

// Job: Toggle between a TimerForm and a plus icon
class ToggleableTimerForm extends React.Component {
    state = { isOpen: false, };
    // making use of property initalizers. Must use an arrow function to ensure "this" is bound
    // to component. 
    handleFormOpen = () => { this.setState( {isOpen: true} ); };
    handleFormCancel = () => { this.setState( {isOpen: false} ); };
    handleFormSubmit = (timer) => {
        this.props.onFormSubmit(timer);
        this.setState( {isOpen: false} );
    };

    render() {
        if (this.state.isOpen) {
            return (
                <TimerForm 
                    onFormCancel={this.handleFormCancel}
                    onFormSubmit={this.handleFormSubmit}
                />
            );
        } else {
            return (
                <div className='ui basic content center aligned segment'>
                    <button 
                        className='ui basic button icon'
                        onClick={this.handleFormOpen}
                    >
                        <i className='plus icon' />
                    </button>
                </div>
            );
        }
    }
}

// Job: Display a timer
class Timer extends React.Component {
    handleTrashClick = () => {
        this.props.onTrashClick(this.props.id);
    };
    componentDidMount() {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 50);
    }
    componentWillUnmount() {
        clearInterval(this.forceUpdateIntervalID);
    }
    handleStartClick = () => {
        this.props.onStartClick(this.props.id);
    };
    handleStopClick = () => {
        this.props.onStopClick(this.props.id);
        console.log("handleStopClick fires in Timer Component");
    }
    render() {
        const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
        return (
            <div className='ui centered card'>
                <div className='content'>
                    <div className='header'>
                        {this.props.title}
                    </div>
                    <div className='meta'>
                        {this.props.project}
                    </div>
                    <div className='center aligned description'>
                        <h2>
                            {elapsedString}
                        </h2>
                    </div>
                    <div className='extra content'>
                        <span 
                            className='right floated edit icon'
                            onClick={this.props.onEditClick}
                        >
                            <i className='edit icon' />
                        </span>
                        <span 
                            className='right floated trash icon'
                            onClick={this.handleTrashClick}
                        >
                            <i className='trash icon' />
                        </span>
                    </div>
                </div>
                <TimerActionButton
                    timerIsRunning={!!this.props.runningSince}
                    onStartClick={this.handleStartClick}
                    onStopClick={this.handleStopClick}
                />
            </div>
        );
    }
}

// Manages Start and Stop functionality on Timer
class TimerActionButton extends React.Component {
    render() {
        if (!this.props.timerIsRunning) {
            return (
                <div 
                    className='ui bottom attached green basic button'
                    onClick={this.props.onStartClick}
                >
                    Start
                </div>
            );
        } else {
            return (
                <div 
                    className='ui bottom attached red basic button'
                    onClick={this.props.onStopClick}
                >
                    Stop
                </div>
            );
        }
    } 
}
ReactDOM.render(
  <TimersDashboard />,
  document.getElementById('content')
);