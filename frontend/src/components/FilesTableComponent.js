import React, {Component} from 'react';

class FilesTableComponent extends Component {
    
    renderTableHeader() {
        let header = this.props.colNames;
        return header.map((colName, index) => {
            return <th scope="col" key={index}>{colName}</th>
        })
    }

    renderTableBody() {
        return this.props.files.map(function(file, index) {
            return <tr key={index++}>
                <th scope="row">{index}</th>
                <td>{file.extension}</td>
                <td>
                    <a href={this.props.url + file.filename}>
                        {file.filename.substring(0, file.filename.lastIndexOf('.'))}
                    </a>
                </td>
                <td>{file.uploadDate}</td>
                {this.checkPropsId(file, index)}
            </tr>;
        }.bind(this));
    }

    checkPropsId(file, index) {
        if(this.props.id === 'inv') {
            return (<td>
                        <button class="btn btn-secondary btn-sm" onClick={() => this.props.showUpdateModal(file)}>
                            <i class="fa fa-pencil"></i>
                        </button>
                        &nbsp;
                        <button class="btn btn-danger btn-sm" onClick={() => this.props.removeFile(file.filename, index)}>
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>)
        }

        if(this.props.id === 'user') {
            return <td>{file.investigator}</td>
        }
    }

    render() {
        return (
            <table class="table table-hover">
                <thead>
                    <tr>
                        {this.renderTableHeader()}
                    </tr>
                </thead>
                <tbody>
                    {this.renderTableBody()}
                </tbody>
            </table>
        )
    }
}

export default FilesTableComponent;
