import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import i18n from '../i18n';

class UpdateInfoModal extends Component {
    constructor(props) {
        super(props);
        this.state = { newName: '' };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (e) => { 
        this.setState({[e.target.name]: e.target.value});  
    }

    render() {
        return (
            <Modal show={this.props.showUpdateModal} onHide={this.props.closeUpdateModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{i18n.t("Actualizar datos")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <label>{i18n.t("Nombre actual")}:</label>
                    <p class="form-control"><b>{this.props.actualName}</b></p>
                    <br/>
                    <label>{i18n.t("Nuevo nombre")}:</label>
                    <input type="text" name="newName" class="form-control" onChange={this.handleChange} placeholder="Introduce el nuevo nombre"/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.closeUpdateModal}>
                        {i18n.t("Cancelar")}
                    </Button>
                    <Button variant="primary" onClick={() => this.props.applyUpdateModal(this.state.newName)}>
                        {i18n.t("Aplicar cambios")}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default UpdateInfoModal;
