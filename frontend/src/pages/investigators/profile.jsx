import React, { Component } from "react";
import NavBar from "../../components/NavBarUserLogOut";
import InfoModal from "../../components/InfoModal";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import "../../static/profile.css"
import i18n from "../../i18n";
import axios, { post } from 'axios';

const bcrypt = require("bcryptjs")
const saltRounds = 10 

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { msg: '', error: '', showModalMessage: false,
                    newName: '', newEmail: '', newPass: '', 
                    actualPass: '', checkPass: false, showLanguageModal: false};

        this.handler = this.handler.bind(this);
        this.onChange = this.onChange.bind(this);
        this.submitNewInfo = this.submitNewInfo.bind(this);
        this.checkActualPassword = this.checkActualPassword.bind(this);
        this.languageHandler = this.languageHandler.bind(this);
        this.closeLanguageModal = this.closeLanguageModal.bind(this);

        if (sessionStorage.getItem('locale')) {
            i18n.changeLanguage(sessionStorage.getItem('locale'));
        }
    }

    componentDidMount() {
        if (sessionStorage.getItem('locale')) {
            i18n.changeLanguage(sessionStorage.getItem('locale'));
        }

        if (!sessionStorage.getItem('session') || sessionStorage.getItem('session') === null) {
            this.props.history.push('/login');
        } else {
            if (this.props.match.params.username !== sessionStorage.getItem('username')) {
                this.props.history.push('/investigator/' + sessionStorage.getItem('username'));
            }
        }
    }
    
    onChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    async checkActualPassword() {
        var actualPassword = this.state.actualPass;

        return axios.get('http://192.168.1.41:5001/get_user_password', { 
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            },
            params: {
                email: sessionStorage.getItem('session')
            } 
        })
        .then(res => {
            console.log(res.data)
            this.setState({checkPass: bcrypt.compareSync(actualPassword, res.data)});
        })
    }

    profileUpdate(listUpdates){
        const url = 'http://192.168.1.41:5001/update_user_info';
        const data = {
            listUpdates
        }
        const config = {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        }
        return post(url, data, config)
    }

    async submitNewInfo() {
        await this.checkActualPassword();
        if(this.state.checkPass === true) {
            var newEmail = this.state.newEmail; var actualEmail = sessionStorage.getItem('session');
            var username = this.state.newName; var plainPassword = this.state.newPass; 
            var listUpdates = {}; var self = this;

            listUpdates.actualEmail = actualEmail;

            if(newEmail === '' || newEmail === null) {
                listUpdates.newEmail = '';
            } else {
                listUpdates.newEmail = newEmail;
            }

            if(username === '' || username === null) {
                listUpdates.username = '';
            } else {
                listUpdates.username = username;
            }

            if(plainPassword === '' || plainPassword === null) {
                listUpdates.password = '';
            } else {
                listUpdates.password = plainPassword;
            }
            
            if(listUpdates.password === '') {
                this.profileUpdate(listUpdates)
                .then(res => {
                    if(res.data['message'] === 'Everything OK') {
                        sessionStorage.setItem('session', res.data['email']);
                        sessionStorage.setItem('username', res.data['username']);
                        this.setState({ msg: i18n.t('Tus datos se han actualizado correctamente!'), error: '', showModalMessage: true, 
                                        newEmail: '', newName: '', newPass: '', actualPass: '' })
                        this.props.history.push('/investigator/' + sessionStorage.getItem('username') + '/profile');
                    } else {
                        this.setState({ error: res.data['message'], msg:'', showModalMessage: true })
                    }
                })
                .catch(error => {
                    this.setState({ error: i18n.t('Parece que ha habido un error, inténtalo de nuevo.'), msg:'', showModalMessage: true })
                })
            } else { 
                bcrypt.hash(listUpdates.password, saltRounds, function(err, password) {
                    if (err) {
                        throw err;
                    } else {
                        listUpdates.password = password;
                        self.profileUpdate(listUpdates)
                        .then(res => {
                            if(res.data['message'] === 'Everything OK') {
                                sessionStorage.setItem('session', res.data['email']);
                                sessionStorage.setItem('username', res.data['username']);
                                self.setState({ msg: 'Tus datos se han actualizado correctamente!', error: '', showModalMessage: true, 
                                                newEmail: '', newName: '', newPass: '', actualPass: '' })
                                self.props.history.push('/investigator/' + sessionStorage.getItem('username') + '/profile');
                            } else {
                                self.setState.setState({ error: res.data['message'], msg:'', showModalMessage: true })
                            }
                        })
                        .catch(error => {
                            this.setState({ error: i18n.t('Parece que ha habido un error, inténtalo de nuevo.'), msg:'', showModalMessage: true })
                        })
                    }
                })
            }
        } else {
            this.setState({error: i18n.t('Contraseña actual incorrecta. Tienes que introducir tu contraseña actual para confirmar!'), msg: '', showModalMessage: true, actualPass: ''});
        }
    }

    handler() {
        this.setState({showModalMessage: false});
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
                    languageHandler = {this.languageHandler}
                />
                <div class="container">
                    <br/><h1>{i18n.t("Mi perfil")}</h1>
                    <div class="row">
                    <div class="col-sm">
                        <div class="container">
                            <div class="modal fade bd-example-modal-lg show" id="myModal" role="dialog">
                                <div class="modal-dialog modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <button type="button" class="close" data-dismiss="modal">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body" id="dynamic-content">
                                            <img src={require('./default-user.png')} class="zoom" alt="Imagen no disponible"/>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                            
                            <a href="#myModal" role="button" data-toggle="modal">
                                <img src={require('./default-user.png')} class="zoom" alt="Imagen no disponible"/>
                            </a>
                        </div>
                    </div>
                        <div class="col-sm">
                            <div class="container">
                                <p>
                                    <br/>
                                    <div class="form-group">
                                        <label>{i18n.t("Nombre actual")}: <b>{sessionStorage.getItem('username')}</b></label>
                                        <input type="text" name="newName" class="form-control" onChange={this.onChange} placeholder={i18n.t("Introduce un nuevo nombre")} value={this.state.newName}/>
                                    </div>
                                    <div class="form-group">
                                        <label>{i18n.t("Email actual")}: <b>{sessionStorage.getItem('session')}</b></label>
                                        <input type="email" name="newEmail" class="form-control" onChange={this.onChange} placeholder={i18n.t("Introduce un nuevo email")} value={this.state.newEmail}/>
                                    </div>
                                    <br/>
                                    <span class="fa fa-exclamation-circle icon-size"></span>&nbsp;<label>{i18n.t("Modificación de contraseña")}:</label>
                                    <div class="form-group">
                                        <input type="password" name="newPass" id="passw2" class="form-control" onChange={this.onChange} placeholder={i18n.t("Introduce una nueva contraseña")} value={this.state.newPass}/>
                                        <span toggle="#passw2" class="fa fa-fw fa-eye field-icon toggle-password"></span>
                                    </div>
                                    <div class="form-group">
                                        <input type="password" name="actualPass" id="passw1" class="form-control" onChange={this.onChange} placeholder={i18n.t("Introduce tu contraseña actual")} value={this.state.actualPass}/>
                                        <span toggle="#passw1" class="fa fa-fw fa-eye field-icon toggle-password"></span>
                                    </div>
                                    <button type="button" class="btn btn-primary" onClick={() => this.submitNewInfo()}>{i18n.t("Actualizar")}</button>
                                </p>   
                            </div>
                        </div>
                    </div>

                    <InfoModal msg={this.state.msg} error={this.state.error} 
                        showModalMessage={this.state.showModalMessage} 
                        closeModal={this.handler}
                    />

                    <ChangeLanguageModal 
                        showLanguageModal={this.state.showLanguageModal}
                        closeLanguageModal={this.closeLanguageModal}
                        i18n = {i18n}
                    />
                </div>
            </div>
        )
    }
}

export default Profile;