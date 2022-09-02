import React, { Component } from "react";
import NavBar from "../../components/NavBarAdminLogOut";
import InfoModal from "../../components/InfoModal";
import "../../static/admin_content.css";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import i18n from "../../i18n";
import axios, {post} from 'axios';

class AdminContent extends Component {
    constructor(props) {
        super(props);
        this.state = { error: '', msg: '' , showModalMessage: false, 
        content: [], showLanguageModal: false };

        this.handleChange = this.handleChange.bind(this);
        this.handler = this.handler.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.removeInv = this.removeInv.bind(this);
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

        if (!sessionStorage.getItem('session_ad') || sessionStorage.getItem('session_ad') === null) {
            this.props.history.push('/admin');
        } else {
            if (this.props.match.params.username !== sessionStorage.getItem('username_ad')) {
                this.props.history.push('/admin/' + sessionStorage.getItem('username_ad'));
            }

            this.getAllContent();
        }    
    }

    getAllContent() {
        axios.get('http://192.168.1.41:5002/admin/get_all_content', {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        })
        .then(res => {
            if(res.data === 'No content' || !res.data) {
                this.setState({error: i18n.t('¡No hay contenido disponible en el sistema!'), msg:'', showModalMessage: true});
            } else {
                this.setState({content: res.data});
            }
        })
        .catch(error => {
            this.setState({error: error.message, msg:'', showModalMessage: true});
        })

        console.log(this.state.content)
    }

    removeFileInvAxios(url, data) {
        const config = {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        }

        if (data === undefined || data === null) {
            data = {}
        }
        
        return post(url, data, config)
    }

    removeFile(filename, indexUsers, indexFiles) {
        this.removeFileInvAxios('http://192.168.1.41:5002/admin/removeFile/' + filename)
        .then(res => {
            indexUsers = indexUsers -1;
            indexFiles = indexFiles - 1;
            this.state.content[indexUsers].files.splice(indexFiles, 1);
            this.setState({msg: res.data, error: '', showModalMessage: true});
        })
        .catch(error => {
            this.setState({error: error.message, msg:'', showModalMessage: true});
        })

        this.getAllContent();
    }

    removeInv(email, indexUsers) {
        this.removeFileInvAxios('http://192.168.1.41:5002/admin/removeInv', {email})
        .then(res => {
            indexUsers = indexUsers - 1;
            this.state.content.splice(indexUsers, 1);
            this.setState({msg: res.data, error: '', showModalMessage: true});
        })
        .catch(error => {
            this.setState({error: error.message, msg: '', showModalMessage: true});
        })

        this.getAllContent();
    }
    
    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});
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
                <div class="just-padding">
                    <button type="button" class="btn btn-secondary float-right" onClick={() => { this.getAllContent() } }>{i18n.t("Actualizar")} ⟲</button>
                    <br/><br/>

                    {this.state.content.map((user, indexUsers) => {
                        indexUsers = indexUsers + 1;
                        return <div class="list-group list-group-root well">
                                    <a href={'#item-' + indexUsers} class="list-group-item" data-toggle="collapse">
                                        <i class="fa fa-angle-double-right"></i>&nbsp;
                                        {i18n.t("Usuario")} {indexUsers} [<b>{i18n.t("Nombre de usuario")}:</b> {user.username}&nbsp;&nbsp;&nbsp;&nbsp;<b>Email:</b> {user.email}]
                                        <button class="btn btn-danger btn-sm float-right" onClick={() => this.removeInv(user.email, indexUsers)}>
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </a>

                                    <div class="list-group collapse" id={'item-' + indexUsers}>
                                        {user.files.map((file, indexFiles) => {
                                            indexFiles = indexFiles + 1;
                                            return <p class="list-group-item" data-toggle="collapse">
                                                <i class="fa fa-angle-right"></i>&nbsp;
                                                {i18n.t("Documento")} {indexFiles} [
                                                    <b>{i18n.t("Nombre")}: </b>
                                                    <a href={this.props.match.url + '/document/' + file.filename}>
                                                        {file.filename.substring(0, file.filename.lastIndexOf('.'))}
                                                    </a>&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <b>{i18n.t("Extensión")}:</b> {file.extension}&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <b>{i18n.t("Investigador")}:</b> {file.investigator}&nbsp;&nbsp;&nbsp;&nbsp;
                                                    <b>{i18n.t("Fecha de subida")}:</b> {file.uploadDate}
                                                ]
                                                <button class="btn btn-danger btn-sm float-right" onClick={() => this.removeFile(file.filename, indexUsers, indexFiles)}>
                                                    <i class="fa fa-trash"></i>
                                                </button>
                                            </p>
                                        })}
                                    </div>
                                </div>;
                    })}
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
        )
    }
}

export default AdminContent;