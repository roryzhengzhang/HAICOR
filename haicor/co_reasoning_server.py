from flask import Flask, make_response, render_template, url_for
import os
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/')
def index():
    #print(os.path.dirname(app.instance_path))
    resp = make_response(render_template('index.html', css=url_for('static', filename="main.css")))
    resp.headers['Access-Control-Allow-Origin'] = '*' #to support the cross origin request
    resp.cache_control.max_age = 1
    return resp

# @app.after_request
# def add_header(r):
#     """
#     Add headers to both force latest IE rendering engine or Chrome Frame
#     """
#     r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
#     r.headers["Pragma"] = "no-cache"
#     r.headers["Expires"] = "0"
#     r.headers['Cache-Control'] = 'public, max-age=0'
#     return r

@app.route('/test')
def test():
    #print(os.path.dirname(app.instance_path))
    resp = make_response(render_template('index.html', css=url_for('static', filename="main.css")))
    resp.headers['Access-Control-Allow-Origin'] = '*' #to support the cross origin request
    resp.cache_control.max_age = 1
    return resp

if __name__ == '__main__':
    app.run(debug = True)    