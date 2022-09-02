import React, { Component } from "react";
import NavBar from "../../components/NavBarAdminLogOut";
import InfoModal from "../../components/InfoModal";
import AdminTableComponent from "../../components/AdminTableComponent";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import i18n from "../../i18n";
import axios, {post} from 'axios';

class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = { no_accepted_invs: [], user_session: '', error: '', 
        msg: '' , showModalMessage: false, showLanguageModal: false };

        this.handleChange = this.handleChange.bind(this);
        this.handleAcceptUser = this.handleAcceptUser.bind(this);
        this.handleRejectUser = this.handleRejectUser.bind(this);
        this.handler = this.handler.bind(this);
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
            
            this.axiosGetNoUsers(false);
            
        }    
    }
    
    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});
    }

    acceptRejectInvAxios(url, data) {
        const config = {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        }
        return post(url, data, config)
    }

    handleAcceptUser(index, email) {
        this.acceptRejectInvAxios('http://192.168.1.41:5002/admin/accept_inv', {email})
        .then(res => {
            if(res.data === 'Everything OK') {
                index = index - 1;
                this.state.no_accepted_invs.splice(index, 1);
                this.reloadTable();
            } else {
                this.setState({msg: '', error: i18n.t('Ha ocurrido un error al aceptar al usuario, vuelve a intentarlo más tarde.'), showModalMessage: true});
            }
        })
        .catch(function() {
            this.setState({msg: '', error: i18n.t('Parece que ha habido un error, inténtalo de nuevo.'), showModalMessage: true});
        })
    }

    handleRejectUser(index, email) {
        this.acceptRejectInvAxios('http://192.168.1.41:5002/admin/reject_inv', {email})
        .then(res => {
            if(res.data === 'Everything OK') {
                index = index - 1;
                this.state.no_accepted_invs.splice(index, 1);
                this.reloadTable();
            } else {
                this.setState({error: i18n.t('Ha ocurrido un error al rechazar al usuario, vuelve a intentarlo más tarde.'), showModalMessage: true});
            }
        })
    }

    axiosGetNoUsers(update) {
        axios.get('http://192.168.1.41:5002/admin/get_noaccepted_invs', {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        })
        .then(res => {
            if(res.data === 'noInvs' || !res.data) {
                if (update === true) {
                    this.setState({msg: i18n.t('¡No hay solicitudes de usuario!'), showModalMessage: true});
                }
            } else {
                this.setState({no_accepted_invs: res.data});
            }
        })
        .catch(error => {
            this.setState({error: error.message});
        })
    }

    reloadTable() {
        this.axiosGetNoUsers(true);
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
                <br/>
                <div class="container">
                    <br/>
                    <button type="button" class="btn btn-secondary float-right" onClick={() => { this.reloadTable() }}>{i18n.t("Actualizar")} ⟲</button>
                    
                    <br/><br/>
                    <div class="table-responsive">
                        <AdminTableComponent
                            colNames={["No.", "Email", i18n.t("Nombre de usuario"), i18n.t("Fecha y hora"), i18n.t("Aceptar")+"?"]}
                            no_accepted_invs={this.state.no_accepted_invs}
                            handleAcceptUser={this.handleAcceptUser.bind(this)}
                            handleRejectUser={this.handleRejectUser.bind(this)}
                        />
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

export default AdminPage;