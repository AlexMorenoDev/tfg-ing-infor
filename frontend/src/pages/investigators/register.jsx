import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import NavBar from "../../components/NavBarComponent";
import InfoModal from "../../components/InfoModal";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import i18n from "../../i18n";
import axios from 'axios';

const bcrypt = require("bcryptjs")
const saltRounds = 10 

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = { email: '', username: '', password: '', repeat_password: '', error: '', msg: '', showModalMessage: false };

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
        if (sessionStorage.getItem('session')) {
            this.props.history.push('/investigator/' + sessionStorage.getItem('username'));
        }

        if (sessionStorage.getItem('session_ad')) {
            this.props.history.push('/admin/' + sessionStorage.getItem('username_ad'));
        }
    }
    
    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});  
    }
    
    handleSubmit = (e) => {
        if (this.state.password === this.state.repeat_password){
            const email = this.state.email; const username = this.state.username; const plainPassword = this.state.password;
           
            var self = this;
            
            bcrypt.hash(plainPassword, saltRounds, function(err, password) {
                if (err) {
                    throw err;
                } else {
                    axios.post('http://192.168.1.41:5001/register', { email, username, password })
                    .then(res => {
                        self.setState({ msg: res.data, showModalMessage: true })
                    })
                }
            })

            this.setState({ email: '', username: '', password: '', repeat_password: '', error: ''})
            
            
        } else {
            this.setState({ error: i18n.t('¡Las contraseñas introducidas tienen que ser iguales!'), showModalMessage: true })
            this.setState({ password: '', repeat_password: '', msg: ''})
        }
        e.preventDefault();
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
                    <div class="row">
                        <div class="col-sm"></div>
                        <div class="col-sm">
                            <br/>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email" />
                                    <Form.Text className="text-muted">
                                    {i18n.t("Nunca compartiremos tu email con terceros")}.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group controlId="formBasicName">
                                    <Form.Label>{i18n.t("Nombre de usuario")}</Form.Label>
                                    <Form.Control type="text" name="username" value={this.state.username} onChange={this.handleChange} placeholder={i18n.t("Nombre de usuario")} />
                                </Form.Group>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>{i18n.t("Contraseña")}</Form.Label>
                                    <Form.Control type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder={i18n.t("Contraseña")} />
                                </Form.Group>
                                <Form.Group controlId="formBasicPasswordRepeat">
                                    <Form.Label>{i18n.t("Repetir contraseña")}</Form.Label>
                                    <Form.Control type="password" name="repeat_password" value={this.state.repeat_password} onChange={this.handleChange} placeholder={i18n.t("Repetir contraseña")} />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {i18n.t("Registrarse")}
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

export default Register;