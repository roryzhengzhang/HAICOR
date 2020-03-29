from flask import Flask, make_response, render_template, url_for
import os
app = Flask(__name__)

@app.route('/')
def index():
    #print(os.path.dirname(app.instance_path))
    resp = make_response(render_template('index.html', css=url_for('static', filename="main.css")))
    resp.headers['Access-Control-Allow-Origin'] = '*' #to support the cross origin request
    resp.cache_control.max_age = 1
    return resp

@app.route('/test')
def test():
    #print(os.path.dirname(app.instance_path))
    resp = make_response(render_template('test.html', css=url_for('static', filename="main.css")))
    resp.headers['Access-Control-Allow-Origin'] = '*' #to support the cross origin request
    resp.cache_control.max_age = 1
    return resp

if __name__ == '__main__':
    app.run(debug = True)    