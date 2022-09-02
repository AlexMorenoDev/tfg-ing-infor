import React, {Component} from 'react';

class AdminTableComponent extends Component {
    
    renderTableHeader() {
        let header = this.props.colNames;
        return header.map((colName, index) => {
            return <th scope="col" key={index}>{colName}</th>
        })
    }

    renderTableBody() {
        return this.props.no_accepted_invs.map(function(no_user, index) {
            return <tr key={index++}>
                <th scope="row">{index}</th>
                <td>{no_user.email}</td>
                <td>{no_user.username}</td>
                <td>{no_user.date}</td>
                <td>
                    <button onClick={() => this.props.handleAcceptUser(index, no_user.email)} class="btn btn-success"><span>&#10003;</span></button>&nbsp;
                    <button onClick={() => this.props.handleRejectUser(index, no_user.email)} class="btn btn-danger"><span>&#215;</span></button>
                </td>
            </tr>;
        }.bind(this));
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

export default AdminTableComponent;
