/** @jsx React.DOM */

var ApplicationRoot = React.createClass({
    render: function() {
        return (
            <div className='app-root'>
                Hello, bento!
            </div>
        );
    }
});


React.render(
    <ApplicationRoot />,
    document.getElementById('app_root')
);
