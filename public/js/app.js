class TimersDashboard extends React.Component{
	state = {
		timers:[],
		currentTime:''
	}


	componentDidMount(){
		this.loadTimersFromServer();
		
	}

	loadTimersFromServer = () => {
		client.getTimers((serverTimers)=> (
			this.setState({
				timers: serverTimers
			})
			))
	}

	handleCreateFormSubmit = (timer) => {
		this.createTimer(timer);
	}

	createTimer = (timer) =>{
		const t = helpers.newTimer(timer);
		this.setState({
			timers: this.state.timers.concat(t)
			})

		client.createTimer(t);
	}

	updateTimer = (attrs) =>{
		this.setState({
			timers: this.state.timers.map((timer) => {
				if(timer.id === attrs.id){
					return Object.assign({},timer,{
						title: attrs.title,
						project: attrs.project,
					})
				}else{
					return timer
				}
			})
		})

		client.updateTimer(attrs)
	}

	deleteTimer = (timerId) =>{
		this.setState({
			timers: this.state.timers.filter(t => t.id !=timerId)
		})

		this.deleteTimer({id: timerId})
	}

	startTimer = (timerId) =>{
		const now = Date.now();
		this.setState({
			timers: this.state.timers.map((timer)=>{
				if(timer.id === timerId){
					return Object.assign({},timer,{
						runningSince: now
					})
				}else{
					return timer
				}
			})
		})

		client.startTimer({id:timerId, start:now})
	}

	stopTimer = (timerId) => {
		const now = Date.now();
		this.setState({
			timers: this.state.timers.map(timer => {
				if(timer.id === timerId){
					const lastElapsed = now - timer.runningSince;
					return Object.assign({},timer,{
						elapsed: timer.elapsed + lastElapsed,
						runningSince: null,
					})
				}else{
					return timer;
				}
			})	
		})

		client.stopTimer({id: timerId, stop: now})
	}

	setClock = (now) =>{
		this.setState({
			currentTime: now
		})
	}

	render(){
		return(
			<div className='ui three column centered grid'>
			<div className='column'>
			<LittleClock 
			setTime={this.setClock}
			currentTime = {this.state.currentTime}
			/>
				<EditableTimerList 
					timers={this.state.timers} 
					updateTimer={this.updateTimer}
					deleteTimer={this.deleteTimer}
					onStartClick = {this.startTimer}
					onStopClick = {this.stopTimer}
				/>
				<ToggleableTimerForm 
				onFormSubmit={this.handleCreateFormSubmit}
				/>
				
			</div>
			</div>
			)
	}
}


class LittleClock extends React.Component{

	tick = () =>{
		let date = new Date()
		const currentTime = date.toLocaleTimeString()
		this.props.setTime(currentTime)
	}

	
	componentDidMount(){
		setInterval(this.tick,50)
	}

	componentWillUnmount(){
		clearInterval(this.tick)
	}


	render(){
		return(
				<div className='ui basic content center aligned segment'>
					<h2>{this.props.currentTime}</h2>
				</div>
			)
	}
}

class ToggleableTimerForm extends React.Component{
	state = {
		isOpen: false,
	}

	handleFormOpen = () => {

		this.setState({
			isOpen: true
		});
	}

	handleFormClose = () => {
	    this.setState({ isOpen: false });
	  };

	 handleFormSubmit = (timer) => {
	 	this.props.onFormSubmit(timer);
	 	this.setState({isOpen: false});
	 }

	render(){
		if(this.state.isOpen){
			return(
				<div>
				<TimerForm 
				onFormClose={this.handleFormClose} 
				onFormSubmit={this.handleFormSubmit}
				/>
				</div>
				);
		}else{
			return(
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

class EditableTimerList extends React.Component {
	render(){
		const timers = this.props.timers.map(timer=>
			<EditableTimer 
				key = {timer.id}
				id = {timer.id}
				title = {timer.title}
				project = {timer.project}
				elapsed = {timer.elapsed}
				runningSince = {timer.runningSince}
				updateTimer={this.props.updateTimer}
				deleteTimer={this.props.deleteTimer}
				onStartClick={this.props.onStartClick}
				onStopClick={this.props.onStopClick}
			/>
			);
		return(
			<div id='timers'>
				{timers}
			</div>
			);
	}
}



class EditableTimer extends React.Component{
	state = {
		editFormOpen: false,
	}


  handleEditClick = () => {
    this.openForm();
  };

  handleFormClose = () => {
    this.closeForm();
  };

  handleSubmit = (timer) => {
  	this.props.updateTimer(timer);
    this.closeForm();
  };

  closeForm = () => {
    this.setState({ editFormOpen: false });
  };

  openForm = () => {
    this.setState({ editFormOpen: true });
  };


	render(){
		if (this.state.editFormOpen) {
			return(
				<TimerForm 
					id = {this.props.id}
					title = {this.props.title}
					project = {this.props.project}
					onFormSubmit = {this.handleSubmit}
					onFormClose = {this.closeForm}
				/>
			);
		}else{
			return(
				<Timer 
					id = {this.props.id}
					title = {this.props.title}
					project = {this.props.project}
					elapsed = {this.props.elapsed}
					runningSince = {this.props.runningSince}
					onFormEdit = {this.handleEditClick}
					deleteTimer = {this.props.deleteTimer}
					onStartClick = {this.props.onStartClick}
					onStopClick = {this.props.onStopClick}
				/>
				);
		}
	}
} 

class Timer extends React.Component{
	deleteTimer = () => {
		this.props.deleteTimer(this.props.id)
	}

	componentDidMount(){
		this.forceUpdateInter = setInterval( ()=> {this.forceUpdate(),50} )
	}

	componentWillUnmount(){
		clearInterval(this.forceUpdateInter)
	}

	handleStartClick = () =>{
		this.props.onStartClick(this.props.id)
	}

	handleStopClick = () =>{
		this.props.onStopClick(this.props.id)
	}

	render(){
		const elapsedString = helpers.renderElapsedString(this.props.elapsed,this.props.runningSince);

		return(
				<div className='ui centered card'>
					<div className='content'>
						<div className='header'>
							{this.props.title}
						</div>
						<div className='meta'>
							{this.props.project}
						</div>
						<div className='center aligned description'>
							<h2>{elapsedString}</h2>
						</div>
						<div className='extra content'>
							<span 
							className='right floated edit icon'
							onClick={this.props.onFormEdit}
							>
								<i className=' edit icon' />
							</span>
							<span
							 className='right floated trash icon'
							 onClick={this.deleteTimer}
							>
								<i className=' trash icon' />
							</span>							
						</div>
					</div>
					<TimerActionButton 
						timerIsRunning = {!!this.props.runningSince}
						onStartClick = {this.handleStartClick}
						onStopClick = {this.handleStopClick}
					/>
				</div>
			);
	}
}



class TimerForm extends React.Component{

	state = {
		title: this.props.title || '',
		project: this.props.project || '',
	}

	handleTitleChange = (e) => {
		this.setState({
			title: e.target.value
		})
	}

	handleProjectChange = (e) =>{
		this.setState({
			project: e.target.value
		})
	}

	handleSubmit = () =>{
		this.props.onFormSubmit({
			id: this.props.id,
			title: this.state.title,
			project: this.state.project
		})
	}

	onFormClose = () =>{
		this.props.onFormClose()
	}

	render(){
		const submitText = this.props.title ? 'Update' : 'Create'
		return(
				<div className='ui centered card'>
					<div className='content'>
						<div className='ui form'>
							<div className='field'>
								<label>Title</label>
								<input type='text'  
								value={this.state.title}
								onChange={this.handleTitleChange} 
								autoComplete="on"
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
								onClick ={this.handleSubmit}
								>
									{submitText}
								</button>
								<button 
								className='ui basic red button'
								onClick={this.onFormClose}
								>
									Cancel
								</button>
							</div>							
						</div>
					</div>
				</div>
			)
	}
}


class TimerActionButton extends React.Component {
	render(){
		if (this.props.timerIsRunning) {
			return(
				<div 
				className='ui bottom attached blue basic button' 
				onClick={this.props.onStopClick}
				>
						Stop
					</div>
				)
		}else{
			return(
				<div 
				className='ui bottom attached blue basic button' 
				onClick={this.props.onStartClick}
				>
						Start
					</div>
				)
		}
	}
}


ReactDOM.render(
	<TimersDashboard />,
	document.getElementById('content')
)