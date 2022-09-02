import React, { Component } from "react";
import NavBar from "../../components/NavBarComponent";
import InfoModal from "../../components/InfoModal";
import '../../static/admin_login.css';
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import i18n from "../../i18n";

const bcrypt = require("bcryptjs")

class AdminLogin extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '', code: '', 
        hashCode: '', jwttoken: '', rUsername: '', rEmail: '', 
        error: '', msg: '', showModalMessage: false, showCodeModal: false,
        showLanguageModal: false };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handler = this.handler.bind(this);
        this.checkCode = this.checkCode.bind(this);
        this.closeCodeModal = this.closeCodeModal.bind(this);
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
        
        if (sessionStorage.getItem('session')) {
            this.props.history.push('/investigator/' + sessionStorage.getItem('username'));
        }

        if (sessionStorage.getItem('session_ad')) {
            this.props.history.push('/admin/' + sessionStorage.getItem('username_ad'));
        }
    }

    closeCodeModal() {
        this.setState({showCodeModal: false, email: '', password: '', code: '', 
        hashCode: '', jwttoken: '', rUsername: '', rEmail: ''});
    }
    
    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});  
    }
    
    handleSubmit = (e) => {
        const email = this.state.email;
        const passwordInput = this.state.password;

        var self = this;
        axios.get('http://192.168.1.41:5002/admin', { 
            auth: {
                username: email,
                password: passwordInput
            }   
        })
        .then(res => {
            if (typeof res.data['token'] === 'undefined' || res.data['token'] === null) {
                self.setState({msg: '', error: i18n.t('Parece que ha habido un error, inténtalo de nuevo.'), showModalMessage: true})
            } else {
                console.log(res.data)
                self.setState({codeHash: res.data['code'], jwttoken: res.data['token'], 
                            rUsername: res.data['username'], rEmail: email, showCodeModal: true});
            }
        })
        .catch(function () {
            self.setState({msg: '', error: i18n.t('Email y/o contraseña incorrectos!'), showModalMessage: true});
        })

        this.setState({ email: '', username: '', password: '', repeat_password: '', error: ''})
        e.preventDefault();
    }

    checkCode(code) {
        var self = this;
        bcrypt.compare(code, this.state.codeHash, function(err, res) {
            if (err) {
                throw err;
            } else {
                if (res === true) {
                    sessionStorage.setItem('jwt-token', self.state.jwttoken);
                    sessionStorage.setItem('session_ad', self.state.rEmail);
                    sessionStorage.setItem('username_ad', self.state.rUsername);
                    self.props.history.push('/admin/' + self.state.rUsername);
                } else {
                    self.setState({error: i18n.t('Código incorrecto, vuelve a intentarlo de nuevo.'), showModalMessage: true});
                } 
            }
        });
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
                <div id="login">
                    <br/><br/>
                    <div class="container">
                        <div id="login-row" class="row justify-content-center align-items-center">
                            <div id="login-column" class="col-md-6">
                                <div id="login-box" class="col-md-12">
                                    <form id="login-form" class="form" onSubmit={this.handleSubmit}>
                                        <h3 class="text-center text-info">Login</h3>
                                        <div class="form-group">
                                            <label for="email" class="text-info">Email:</label><br/>
                                            <input class="form-control" type="email" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email"/>
                                        </div>
                                        <div class="form-group">
                                            <label for="password" class="text-info">{i18n.t("Contraseña")}:</label><br/>
                                            <input class="form-control" type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder={i18n.t("Contraseña")}/>
                                        </div>
                                        <div class="form-group">
                                            <label for="remember-me" class="text-info"><span>{i18n.t("Recordarme")}</span> <span><input id="remember-me" name="remember-me" type="checkbox"/></span></label><br/>
                                            <input type="submit" name="submit" class="btn btn-info btn-md" value={i18n.t("Iniciar sesión")}/>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <InfoModal msg={this.state.msg} error={this.state.error} 
                        showModalMessage={this.state.showModalMessage} 
                        closeModal={this.handler}/>

                    <Modal show={this.state.showCodeModal} onHide={this.closeCodeModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Código de autenticación</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <label>Código:</label>
                            <input type="text" name="code" class="form-control" onChange={this.handleChange} placeholder="Introduce el código que ha llegado a tu correo electrónico."/>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.closeCodeModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={() => this.checkCode(this.state.code)}>
                                Aceptar
                            </Button>
                        </Modal.Footer>
                    </Modal>

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

export default AdminLogin;