import React, { Component } from "react";
import "../../static/show_document.css";
import i18n from "../../i18n";

class ShowDocumentPage extends Component {

    constructor() {
        super();
        if (sessionStorage.getItem('locale')) {
            i18n.changeLanguage(sessionStorage.getItem('locale'));
        }
    }
   
    render() {
        return (
            <div class="full-height">
                <a href="/" class="btn btn-primary fixed-top mx-auto top-button block">{i18n.t("VOLVER")}</a>
                <br/><br/>
                <iframe src={"http://192.168.1.41:5002/document/" + this.props.match.params.filename} 
                width="100%" height="100%" title="show_file_content"/>
            </div>
        )
    }
}

export default ShowDocumentPage;