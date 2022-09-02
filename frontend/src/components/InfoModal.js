import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import i18n from '../i18n';

class InfoModal extends Component {

    render() {
        
        const renderMsg = () => {
            if(this.props.msg !== '') {
                return <p>{ this.props.msg }</p>;
            }
        }

        const renderError = () => {
            if(this.props.error !== '') {
                return  <p>{ this.props.error }</p>;
            }
        }

        return (
            <Modal show={this.props.showModalMessage} onHide={this.props.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{i18n.t("Mensaje")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { renderMsg() }
                    { renderError() }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.props.closeModal}>
                        {i18n.t("Aceptar")}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default InfoModal;
