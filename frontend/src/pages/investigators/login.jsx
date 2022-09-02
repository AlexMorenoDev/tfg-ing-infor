import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NavBar from "../../components/NavBarComponent";
import InfoModal from "../../components/InfoModal";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import i18n from "../../i18n";
import axios from 'axios';

// const bcrypt = require("bcryptjs")

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '', error: '', msg: '', 
        showModalMessage: false, showLanguageModal: false };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handler = this.handler.bind(this);
        this.languageHandler = this.languageHandler.bind(this);
        this.closeLanguageModal = this.closeLanguageModal.bind(this);

        if (sessionStorage.getItem('locale')) {
            i18n.changeLanguage(sessionStorage.getItem('locale'));
        }
    }

    componentDidMount() {
        if (sessionStorage.getItem('session_ad')) {
            this.props.history.push('/admin/' + sessionStorage.getItem('username_ad'));
        }

        if (sessionStorage.getItem('session')) {
            this.props.history.push('/investigator/' + sessionStorage.getItem('username'));
        }
    }
    
    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});  
    }
    
    handleSubmit = (e) => {
        const email = this.state.email;
        const passwordInput = this.state.password;

        var self = this;
        axios.get('http://192.168.1.41:5001/login', { 
            auth: {
                username: email,
                password: passwordInput
            }    
        })
        .then(res => {
            if (typeof res.data['token'] === 'undefined' || res.data['token'] === null) {
                self.setState({msg: '', error: i18n.t('Parece que ha habido un error, vuelve a intentarlo de nuevo.'), showModalMessage: true})
            } else {
                sessionStorage.setItem('session', email);
                sessionStorage.setItem('username', res.data['username']);
                sessionStorage.setItem('jwt-token', res.data['token']);
                self.props.history.push('/investigator/' + res.data['username']);
            }
            // if(res.data === 'noInvs' || !res.data) {
            //     this.setState({error: 'No existe ningún usuario registrado con ese email', showModalMessage: true});
            // } else {
                // var username = res.data['username'];
                // bcrypt.compare(passwordInput, res.data['password'], function(err, res) {
                //     if (err) {
                //         throw err;
                //     } else {
                //         if (res === true) {
                //             sessionStorage.setItem('session', email);
                //             sessionStorage.setItem('username', username);
                //             self.props.history.push('/investigator/' + username);
                //         } else {
                //             self.setState({error: 'Email y/o contraseña incorrectos', showModalMessage: true});
                //         } 
                //     }
                // });
            // }
        })
        .catch(function () {
            self.setState({msg: '', error: i18n.t('Email y/o contraseña incorrectos!'), showModalMessage: true});
        })

        this.setState({email: '', username: '', password: '', repeat_password: '', error: ''})
        e.preventDefault();
    }

    languageHandler() {
        this.setState({showLanguageModal: true});
    }

    closeLanguageModal() {
        this.setState({showLanguageModal: false});
    }

    handler() {
        this.setState({showModalMessage: false});
    }

    render() {
        return (
            <div>
                <NavBar
                    languageHandler = {this.languageHandler}
                />
                <div class="container">
                    <div class="row">
                        <div class="col-sm"></div>
                        <div class="col-sm">
                            <br/>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Text className="text-muted">
                                    {i18n.t("Bienvenido a nuestro sistema de login")}
                                </Form.Text>
                                <br/>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email" />
                                </Form.Group>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>{i18n.t("Contraseña")}</Form.Label>
                                    <Form.Control type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Contraseña" />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {i18n.t("Iniciar sesión")}
                                </Button> 
                            </Form>
                        </div>
                        <div class="col-sm"></div>
                    </div>
                    <InfoModal msg={this.state.msg} error={this.state.error} 
                        showModalMessage={this.state.showModalMessage} 
                        closeModal={this.handler}/>
                </div>
                <ChangeLanguageModal 
                    showLanguageModal={this.state.showLanguageModal}
                    closeLanguageModal={this.closeLanguageModal}
                    i18n = {i18n}
                />
            </div>
        )
    }
}

export default Login;