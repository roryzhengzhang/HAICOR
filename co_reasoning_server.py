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


@app.route('/task_description')
def task_description():
    resp = make_response(render_template('task_description.html', css=url_for('static', filename="main.css")))
    return resp

@app.route('/human_needs_explanation')
def human_needs_explanation():
    resp = make_response(render_template('human_needs_explanation.html', css=url_for('static', filename="main.css"),  img_source=url_for('static', filename="human_needs_explanation.JPG")))
    return resp

@app.route('/commonsense_explanation')
def commonsense_explanation():
    resp = make_response(render_template('commonsense_explanation.html', css=url_for('static', filename="main.css"),  img_source=url_for('static', filename="sample_kg.JPG"), 
    further_step_image=url_for('static', filename="step-by-step image.png")))
    return resp

@app.route('/story_example')
def story_example():
    resp = make_response(render_template('story_example.html', css=url_for('static', filename="main.css"),  img_source=url_for('static', filename="story_example.JPG")))
    return resp

@app.route('/visualized_explanation')
def visualized_exp():
    resp = make_response(render_template('visualized_explanation.html', css=url_for('static', filename="main.css"), 
     img_source=url_for('static', filename="visualized_sample.JPG"),
     img_star_source=url_for('static', filename="star_chart.JPG"),
     img_bar_source=url_for('static', filename="path_influence_chart.JPG")))
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