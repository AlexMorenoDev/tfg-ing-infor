import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import i18n from '../i18n';

class UpdateInfoModal extends Component {
    constructor(props) {
        super(props);
        this.state = { locale: "es" };

        this.handleChange = this.handleChange.bind(this);
        this.changeLanguage = this.changeLanguage.bind(this);
    }

    handleChange(newLang) {
        this.setState({ locale: newLang });
    }

    changeLanguage() {
        this.props.i18n.changeLanguage(this.state.locale);
        sessionStorage.setItem('locale', this.state.locale);
        this.props.closeLanguageModal();
    }

    render() {
        return (
            <Modal show={this.props.showLanguageModal} onHide={this.props.closeLanguageModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{i18n.t("Selecciona un idioma")}:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div class="form-check-inline">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="optradio" onClick={() => this.handleChange('es')} />{i18n.t("Español")}&nbsp;
                            <img src="https://www.countryflags.io/es/flat/24.png" class="img-fluid" alt="-"></img>
                        </label>
                    </div>
                    <div class="form-check-inline">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="optradio" onClick={() => this.handleChange('en')} />{i18n.t("Inglés")}&nbsp;
                            <img src="https://www.countryflags.io/gb/flat/24.png" class="img-fluid" alt="-"></img>
                        </label>
                    </div>
                    <div class="form-check-inline">
                        <label class="form-check-label">
                            <input type="radio" class="form-check-input" name="optradio" onClick={() => this.handleChange('eu')} />{i18n.t("Euskera")}&nbsp;
                            <img src={require('../static/basque_country_flag.png')} style={{width: 23, height: 17}} class="img-fluid" alt="-"></img>
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.closeLanguageModal}>
                        {i18n.t("Cancelar")}
                    </Button>
                    <Button variant="primary" onClick={this.changeLanguage}>
                        {i18n.t("Guardar")}
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default UpdateInfoModal;
