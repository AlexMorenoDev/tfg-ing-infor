import React, {Component} from 'react';
import i18n from "../i18n";

class NavBarComponent extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        let currentList = [];
        let newList = [];

        if (e.target.value !== "") {
            currentList = this.props.files;

            newList = currentList.filter(item => {
                const lc = item.filename.toLowerCase();
                const filter = e.target.value.toLowerCase();
                return lc.includes(filter);
            });
        } else {
            newList = this.props.files;
        }
        this.props.handler(newList);
    }

    render() {
        return (
            <nav class="navbar navbar-expand-md navbar-dark bg-dark">
                <a href="/" class="navbar-brand">{i18n.t("Inicio")}</a>
                <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav">
                        <a href="/" class="nav-item nav-link active">{i18n.t("Inicio")}</a>
                        <a href="/register" class="nav-item nav-link">{i18n.t("Registro")}</a>
                        <a href="/login" class="nav-item nav-link">{i18n.t("Acceder")}</a>
                    </div>
                    <form class="form-inline ml-auto">
                        <input type="text" onChange={this.handleChange} class="form-control mr-sm-2" placeholder={i18n.t("Buscar")}/>
                    </form>
                    <button type="button" onClick={this.props.languageHandler} class="btn btn-dark"><i class="fa fa-globe" style={{fontSize: 20, color: "#0069d9"}}></i></button>
                </div>
            </nav>
        )
    }
}

export default NavBarComponent;
