import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import NavBar from "../../components/NavBarUserLogOut";
import InfoModal from "../../components/InfoModal";
import FilesTableComponent from "../../components/FilesTableComponent";
import UpdateInfoModal from "../../components/UpdateInfoModal";
import ChangeLanguageModal from "../../components/ChangeLanguageModal";
import i18n from "../../i18n";
import axios, { post } from 'axios';

class InvestigatorPage extends Component {
    constructor(props) {
        super(props);
        this.state = { msg: '', error: '', file: null, my_files: [], 
        showModalUpload: false, showModalMessage: false, showLanguageModal: false,
        showUpdateModal: false, actualName: '', filenameToUpdate: ''};

        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
        this.handler = this.handler.bind(this);
        this.closeUpdateModal = this.closeUpdateModal.bind(this);
        this.applyUpdateModal = this.applyUpdateModal.bind(this);
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
        
            this.getMyFiles();
        }
    }

    getMyFiles() {
        axios.get('http://192.168.1.41:5001/get_my_files', {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            },
            params: {
                email: sessionStorage.getItem('session')
            }
        })
        .then(res =>  {
            if(res.data === 'No files' || !res.data) {
                this.setState({msg: i18n.t('¡No has subido ningún archivo todavía!'), error: '', showModalMessage: true});
            } else {
                this.setState({my_files: res.data});
            }
        })
        .catch(error => {
            this.setState({error: error.message, msg: '', showModalMessage: true});
        });
    }
    
    onChange(e) {
        this.setState({file: e.target.files[0]})
    }

    fileUpload(file){
        const url = 'http://192.168.1.41:5001/file_upload';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', sessionStorage.getItem('session'));
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        }
        return post(url, formData, config)
    }

    onFormSubmit(e){
        e.preventDefault();
        if (this.state.file.name.length < 35 && this.state.file.name.length > 0) {
            this.fileUpload(this.state.file)
            .then((res) => {
                if (res.data === 'Error - Name not valid') {
                    this.setState({msg: '', error: i18n.t('Ponle otro nombre al archivo e inténtalo de nuevo.'), showModalMessage: true });
                }

                if (res.data === 'Everything OK!') {
                    this.setState({msg: i18n.t('Archivo guardado correctamente!'), error:'', showModalMessage: true});
                }

                this.getMyFiles();
            })
        } else {
            this.setState({msg: '', error: i18n.t('El nombre del archivo subido debe tener entre 1 y 35 caracteres. Inténtalo de nuevo.'), showModalMessage: true});
        }
        
    }

    removeFile(filename, index) {
        axios.get('http://192.168.1.41:5001/remove_file/' + filename, {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        })
        .then(res =>  {
            index = index - 1;
            this.state.my_files.splice(index, 1);
            this.setState({msg: res.data, error:'', showModalMessage: true});
        })
        .catch(error => {
            this.setState({error: error.message, msg:'', showModalMessage: true});
        });

        this.getMyFiles();
    }

    handler() {
        this.setState({showModalMessage: false});
    }

    showUpdateModal(file) {
        this.setState({showUpdateModal: true, filenameToUpdate: file.filename , actualName: file.filename.substring(0, file.filename.lastIndexOf('.'))});
    }

    closeUpdateModal() {
        this.setState({showUpdateModal: false});
    }

    languageHandler() {
        this.setState({showLanguageModal: true});
    }

    closeLanguageModal() {
        this.setState({showLanguageModal: false});
    }

    setMsgAndGetFiles(msg) {
        this.setState({msg: msg, error:'', showUpdateModal: false});
        this.getMyFiles();
        this.setState({showModalMessage: true})
    }

    setErrorAndGetFiles(error) {
        this.setState({error: error, msg:'', showUpdateModal: false});
        this.getMyFiles();
        this.setState({showModalMessage: true})
    }

    fileUpdate(filename, newName){
        const url = 'http://192.168.1.41:5001/update_file/' + filename;
        const data = {
            newName
        }
        const config = {
            headers: {
                'x-access-token': sessionStorage.getItem('jwt-token')
            }
        }
        return post(url, data, config)
    }

    applyUpdateModal(newName) {
        if(!newName || newName === null || newName === '') {
            this.setErrorAndGetFiles(i18n.t('No se puede dejar el campo vacio, vuelve a intentarlo.'));
        } else {
            this.fileUpdate(this.state.filenameToUpdate, newName)
            .then(res =>  {
                this.setMsgAndGetFiles(res.data);
            })
            .catch(error => {
                this.setErrorAndGetFiles(i18n.t('Parece que ha habido un error, inténtalo de nuevo.'));
            });
        }
    }
    
    render() {

        const handleCloseUpload = () => this.setState({showModalUpload: false});
        const handleShowUpload = () => this.setState({showModalUpload: true, msg: ''});
        return (
            <div>
                <NavBar
                    languageHandler = {this.languageHandler}
                />
                <br/>
                <div class="container">
                    <Button variant="btn btn-primary float-right" onClick={handleShowUpload}>
                        {i18n.t("Subir")}...
                    </Button>
                    <h3>{i18n.t("Bienvenido")} { sessionStorage.getItem('username') }!</h3>
                    <h3>{i18n.t("Tus documentos y archivos")}:</h3>
                    <div class="table-responsive">
                        <FilesTableComponent
                            colNames={["No.", i18n.t("Tipo"), i18n.t("Nombre"), i18n.t("Última modificación"), ""]}
                            url={'/investigator/' + sessionStorage.getItem('username') + '/document/'}
                            files={this.state.my_files}
                            id={'inv'}
                            removeFile={this.removeFile.bind(this)}
                            showUpdateModal={this.showUpdateModal.bind(this)}
                        />
                    </div>
                    
                    <Modal show={this.state.showModalUpload} onHide={handleCloseUpload}>
                        <form onSubmit={this.onFormSubmit}>
                            <Modal.Header closeButton>
                                <Modal.Title>{i18n.t("Sube tu documento")}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <input type="file" onChange={this.onChange} accept=
                                ".xlsx, .xls, .jpg, .jpeg, .png, .doc, .docx, .ppt, .pptx, .txt, .pdf, .py, .js"/>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleCloseUpload}>
                                    {i18n.t("Cerrar")}
                                </Button>
                                <Button type="submit" variant="primary" onClick={handleCloseUpload}>
                                    {i18n.t("Subir")}
                                </Button>
                            </Modal.Footer>
                        </form>
                    </Modal>

                    <UpdateInfoModal
                        showUpdateModal={this.state.showUpdateModal}
                        closeUpdateModal={this.closeUpdateModal}
                        applyUpdateModal={this.applyUpdateModal}
                        actualName={this.state.actualName}
                    />
                    
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

export default InvestigatorPage;
