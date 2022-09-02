import React from "react";
import '../static/404.css';
import i18n from "../i18n";

const NotFoundPage = () => {
    return (
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="error-template">
                        <h1>Oops!</h1>
                        <h2>404 Not Found</h2>
                        <div class="error-details">
                            {i18n.t("Lo sentimos, parece que ha habido un error. Página no encontrada!")}
                        </div>
                        <div class="error-actions">
                            <a href="/" class="btn btn-primary btn-lg">
                                {i18n.t("Página principal")} 
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage;