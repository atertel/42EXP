import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import join_project from '../actions/projects/join_project';
import edit_project from '../actions/projects/edit_project';
import ProjectForm from '../components/ProjectForm';
import Modal from 'react-modal';
import {Link} from 'react-router';
import Remarkable from 'remarkable';

const md = new Remarkable({})

class ProjectDetail extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      project_details:{},
      modalIsOpen:false
    }
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal(){
    this.setState({modalIsOpen:true})
  }

  closeModal(){
    this.setState({modalIsOpen:false})
  }

  fetchData(id){
    socket.emit('project:detail',{id:id},function(err,data){
      if(err){
        console.log('error: ',err)
      }else{
        this.setState({project_details:data})
      }
    }.bind(this))
  }

  componentDidMount(){
    console.log('mounted')
    if(socket){
      this.fetchData(this.props.params.projectId)
    }
  }

  handleJoinProject(){
    this.props.join_project({id:this.props.params.projectId,project:this.state.project_details.project_name})
  }

  render(){
    return(
      <div className="project_detail">

        <div className="main_content">
          <h2 className="main_content__name">{this.state.project_details.project_name}</h2>
          <h2 className="main_content__category"> Category : {this.state.project_details.project_category} </h2>
          <h2 className="main_content__owner">Started by : <Link to={`/user/${this.state.project_details.project_owner}`}>{this.state.project_details.project_owner}</Link></h2>
          <div className="description"> <span dangerouslySetInnerHTML={{__html:md.render(this.state.project_details.project_description)}}/></div>
          {
            !this.props.isAuthenticated  ?
            <a href= "/auth/github">
              <button className="main_content__login">
                  Login To Join Project
              </button>
            </a>
            :
            this.props.project ?
              this.props.project.role == 'owner' ?
              <button className="main_content__edit_project" onClick={this.openModal}>Edit Project </button> :
              null
              :
              <button className="main_content__join_project" onClick={this.handleJoinProject.bind(this)}>Join Project </button>
          }
        </div>

        <div className="secondary_content">
          <div className="project_links">
            {
              this.state.project_details.github_link ?

              <a href={this.state.project_details.github_link} className="project_links__item"><button>Project Repo</button> </a>
              :
              null
            }
            {
              this.state.project_details.reddit_link ?

              <a href={this.state.project_details.reddit_link} className="project_links__item"><button>Reddit Discussion</button></a>
              :
              null
            }
          </div>

          <div className="project_skills" >
            <h3>Skills Required : </h3>
            {
              this.state.project_details.skills?
              this.state.project_details.skills.map((skill) => {
                return (

                    <button className="project_skills__skill" key={skill.skill_id}>{skill.name}</button>
                )
              })
              :
              null
            }
          </div>
        </div>
        <Modal isOpen={this.state.modalIsOpen}
               onRequestClose={this.closeModal}
               className="content-project"
               overlayClassName="overlay-project" >

            <ProjectForm
              {...this.state.project_details}
              id = {this.props.params.projectId}

            edit_project={this.props.edit_project} close={this.closeModal}/>

        </Modal>

      </div>
    )
  }
}

const mapStateToProps = (state,ownProps) => {
  let username,project
  let projectIndex = state.Projects.findIndex((proj) => {
    return proj.id == ownProps.params.projectId
  })

  project = state.Projects[projectIndex]

  const {isAuthenticated} = state.User
  if(isAuthenticated){
    username = state.User.username
  }
  return {
    isAuthenticated,username,project
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    join_project,
    edit_project
  },dispatch)
}

const ProjectDetailContainer = connect(mapStateToProps,mapDispatchToProps)(ProjectDetail)
export default ProjectDetailContainer;
