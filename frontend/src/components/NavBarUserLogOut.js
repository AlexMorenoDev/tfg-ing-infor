import React, {Component} from 'react';
import i18n from "../i18n";

class NavBarUserLogOutComponent extends Component {
    
    closeSession() {
        sessionStorage.removeItem('session');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('jwt-token');
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
                    </div>
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="/#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {sessionStorage.getItem('username')}
                            </a>
                            <div class="dropdown-menu dropdown-menu-right animate slideIn" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item" href={"/investigator/" + sessionStorage.getItem('username') + "/profile"}>{i18n.t("Mi perfil")}</a>
                                <button type="button" onClick={this.props.languageHandler} class="dropdown-item">{i18n.t("Idioma")} <i class="fa fa-globe" style={{fontSize: 20, color: "#0069d9"}}></i></button>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="/login" onClick={() => this.closeSession()}>{i18n.t("Cerrar sesión")}</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
        )
    }
}

export default NavBarUserLogOutComponent;
