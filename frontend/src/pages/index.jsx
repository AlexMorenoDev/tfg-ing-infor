import React, { Component } from "react";
// import { Link } from "react-router-dom";
import NavBar from "../components/NavBarComponent";
import ChangeLanguageModal from "../components/ChangeLanguageModal";
import '../static/index.css';
import i18n from "../i18n";
import axios from 'axios';

class MainPage extends Component {

    constructor(props) {
        super(props);
        this.state = { msg: '', error: '', showModalMessage: false, 
        files: [], filtered_files: [], showLanguageModal: false };

        this.getFiles = this.getFiles.bind(this);
        this.handler = this.handler.bind(this);
        this.languageHandler = this.languageHandler.bind(this);
        this.closeLanguageModal = this.closeLanguageModal.bind(this);

        if (sessionStorage.getItem('locale')) {
            i18n.changeLanguage(sessionStorage.getItem('locale'));
        }
    }

    componentDidMount() {
        var temp = false;
        
        if (sessionStorage.getItem('session_ad')) {
            this.props.history.push('/admin/' + sessionStorage.getItem('username_ad'));
            temp = true;
        }

        if (sessionStorage.getItem('session')) {
            this.props.history.push('/investigator/' + sessionStorage.getItem('username'));
        }

        if (temp === false) {
            this.getFiles();
        }
    }

    getFiles() {
        axios.get('http://192.168.1.41:5000/documents')
        .then(res =>  {
            if(res.data === 'No files' || !res.data) {
                this.setState({msg: i18n.t('¡No hay contenido disponible!'), error:'', showModalMessage: true});
            } else {
                this.setState({files: res.data, filtered_files: res.data});
            }
        })
        .catch(error => {
            this.setState({error: error.message, msg: '', showModalMessage: true});
        });
    }

    handler(newList) {
        this.setState({filtered_files: newList});
    }

    languageHandler() {
        this.setState({showLanguageModal: true});
    }

    closeLanguageModal() {
        this.setState({showLanguageModal: false});
    }

    render() {
        return (
            <div>
                <NavBar
                    files={this.state.files}
                    handler = {this.handler}
                    languageHandler = {this.languageHandler}
                />
                <br/>
                <div class="container">
                    <br/>
                    <div class="row">
                    {this.state.filtered_files.map(function(file) {
                            return <div class="col-sm-3 d-flex align-items-stretch">
                                <div class="container">
                                    <p>
                                        <div class="card">
                                        {/* {'../static/filesImages/' + file.extension + '.png'} */}
                                            <div class="card-body d-flex flex-column">
                                                <h5 class="card-title"><b>{i18n.t("Documento")}</b></h5>
                                                <img src={require('../static/filesImages/' + file.extension.substring(1) + '.png')} class="card-img mx-auto" alt={require('../static/filesImages/generic.png')}/>
                                                <p></p>
                                                <p class="card-text">{file.filename.substring(0, file.filename.lastIndexOf('.'))}</p>
                                                <p class="card-text">{file.uploadDate}</p>
                                                <a href={'/users/document/' + file.filename} class="btn btn-primary mt-auto">{i18n.t("Visualizar")}</a>
                                            </div>
                                        </div>                                           
                                    </p>
                                </div>
                            </div>
                        })}   
                    </div>
                </div>
                <ChangeLanguageModal 
                    showLanguageModal={this.state.showLanguageModal}
                    closeLanguageModal={this.closeLanguageModal}
                    i18n = {i18n}
                />
                {/* <Link to="/users">Usuarios</Link> */}
            </div>
        )
    }
}

export default MainPage;