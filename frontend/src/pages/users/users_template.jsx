import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import NavBar from "../../components/NavBarComponent";
import InfoModal from "../../components/InfoModal";
import FilesTableComponent from "../../components/FilesTableComponent";
import axios from 'axios';

class UsersPage extends Component {
    constructor(props) {
        super(props);
        this.state = { msg: '', error: '', files: [], 
                    imageFiles: [], pdfFiles: [], micOffFiles: [], 
                    codeFiles:[], showModalMessage: false };

        this.getFiles = this.getFiles.bind(this);
        this.handler = this.handler.bind(this);
    }

    componentDidMount() {
        this.getFiles();
    }

    getFiles() {
        axios.get('http://192.168.1.41:5000/documents')
        .then(res =>  {
            if(res.data === 'No files' || !res.data) {
                this.setState({msg: '¡No hay contenido disponible!', error:'', showModalMessage: true});
            } else {
                this.setState({files: res.data});
            }
        })
        .catch(error => {
            this.setState({error: error.message, msg: '', showModalMessage: true});
        });
    }

    handler() {
        this.setState({showModalMessage: false});
    }
    
    render() {
        return (
            <div>
                <NavBar/>
                <br/>
                <div class="container">
                    <Button variant="btn btn-primary float-right" onClick={() => this.getFiles()}>
                        Actualizar
                    </Button>
                    <h3>Documentos y contenido accesible:</h3>
                    <br/>
                    <div class="table-responsive">
                        <FilesTableComponent
                            colNames={["No.", "Tipo", "Nombre", "Fecha de subida", "Investigador"]}
                            url={'/users/document/'}
                            files={this.state.files}
                            id={'user'}
                        />
                    </div>
                        
                    <InfoModal msg={this.state.msg} error={this.state.error} 
                        showModalMessage={this.state.showModalMessage} 
                        closeModal={this.handler}/>
                </div>
            </div>
        )
    }
}

export default UsersPage;