from igraph import *
import json


def find_path_index(paths, element):
    indices = []
    for path in paths:
        if element in path:
            indices.append(paths.index(path))
    return indices

def main():
    extract_path = ['morning related to section related to family', 'family has context biology related to study', 'family Synonym class related to study', 'study HasSubevent learn MotivatedByGoal curious related to curiosity', 'study Synonym research related to finding_information has prerequisite curiosity', 'curiosity related to wonder manner of question related to test', 'curiosity causes desire read manner of audition is a test', 'need causes desire buy Antonym save_money', 'math at location class related to order', 'order related to out derived from tryout related to test', 'order related to put has context testing form of test', 'test related to contest is a competition', 'test Antonym quiz related to competition', 'competition related to big', 'need Antonym sufficient related to self_sufficient similar to independent', 'need related to strong Synonym strong_minded similar to independent', 'independent similar to unconditional related to absolute has context math', 'independent similar to commutative has context mathematics related to math', 'study Etymologicallyrelated to studio related to organization related to health', 'study related to examination related to examine related to health', 'health related to necessity is a need', 'health related to organism CapableOf need', 'need related to shelter related to haven related to safety', 'need related to shelter related to refuge related to safety', 'safety is a condition related to test', 'morning related to sleep manner of rest', 'morning related to break related to rest', 'rest Antonym work Synonym study', 'rest Antonym play Antonym study', 'test related to judgment related to power', 'test related to knowledge has property power', 'power has context mathematics related to study', 'power related to work Synonym study', 'need related to desire related to love', 'need related to like DistinctFrom love', 'love related to big', 'study has context academic related to conform related to social', 'study PartOf house used for social_status derived from social', 'social related to friendly related to friendship related to need', 'social related to friendly derived from friend at location need', 'big related to praise is a approval', 'approval related to requirement related to need', 'approval is a satisfaction related to need', 'study Synonym cogitation is a idea related to idealism', 'study PartOf education related to idea related to idealism', 'idealism Antonym materialism is a desires related to need', 'idealism causes desire create_to_help_other_people HasSubevent satisfaction related to need', 'need related to poor related to status', 'need is a condition related to status', 'status related to position related to dance related to night Antonym morning', 'status related to situation related to post related to cereal related to morning', 'need related to food', 'food related to breakfast related to morning', 'food related to meal related to morning', 'need Antonym give related to its related to belonging', 'need related to must_have related to own related to belonging', 'belonging Synonym possession dbpedia/genre novel related to big', 'belonging derived from belong derived from long related to big', 'test related to distinction related to honor', 'honor Synonym glory related to hope related to need', 'honor related to bestow related to use related to need', 'study has prerequisite settle_down related to calm', 'calm related to relaxing used for evening Antonym morning', 'calm related to smooth Entails rub related to morning']

    relations = ['related to', 'FormOf', 'is a', 'PartOf', 'HasA', 'UsedFor', 'CapableOf', 'At Location', 'Causes',
             'HasSubevent', 'HasFirstSubevent', 'HasLastSubevent', 'has prerequisite', 'Has Property', 'MotivatedByGoal',
             'ObstructedBy', 'Desires', 'CreatedBy', 'Synonym', 'Antonym', 'DistinctFrom', 'Derived From',
             'SymbolOf', 'DefinedAs', 'manner of', 'LocatedNear', 'Has Context', 'Similar To', 'EtymologicallyRelatedTo',
             'EtymologicallyDerivedFrom', 'Causes Desire', 'MadeOf', 'ReceivesAction', 'ExternalURL']

    #convert extract_path and relations to lower case
    extract_path = list(map(str.lower, extract_path))
    relations = list(map(str.lower, relations))
    #split the extract_path by the relations in 'relations'
    temp = []
    ids = dict()
    json_temp = {'nodes': [], 'links': []}
    id = 0
    results = extract_path.copy()
    for rel in relations:
        for path in results:
            temp.extend(path.split(" "+rel+" "))
        results = temp.copy()
        temp = []
    results = list(set([x.strip(' ') for x in results]))
    g = Graph()
    #add 'len(results)' vertices into graph 
    g.add_vertices(len(results))
    g.vs['name'] = results
    #print(g.vs['name'])
    for rel in relations:
        for v1 in results:
            for v2 in results:
                if v2 != v1:
                    for path in extract_path:
                        #print("v1:"+v1+"; v2:"+v2+"; path:"+path)
                        phrase = v1+" "+rel+" "+v2
                        #print(phrase)
                        if phrase in path:
                            node_v1 = dict()
                            node_v2 = dict()
                            id_v1 = 0
                            id_v2 = 0
                            a_index=g.vs.find(name_eq=v1).index
                            b_index=g.vs.find(name_eq=v2).index
                            #print("a_index: "+str(a_index)+"; b_index: "+str(b_index))
                            g.add_edge(a_index, b_index)
                            if v1 in ids.keys():
                                id_v1 = ids[v1]
                            else:
                                id_v1 = id
                                #append the new vertex to the 'nodes'
                                json_temp['nodes'].append({'id': id_v1, 'name': v1, 'num_path': find_path_index(extract_path, v1)})
                                ids[v1] = id_v1
                                id = id + 1
                            if v2 in ids.keys():
                                id_v2 = ids[v2]
                            else:
                                id_v2 = id
                                #append the new vertex to the 'nodes'
                                json_temp['nodes'].append({'id': id_v2, 'name': v2, 'num_path': find_path_index(extract_path, v2)})
                                ids[v2] = id_v2
                                id = id + 1
                            
                            #add the edge
                            json_temp['links'].append({"source": id_v1, "target": id_v2, "type": rel, 'num_path': find_path_index(extract_path, phrase)})

    #print("number of vextex: "+str(len(g.vs)))
    #print("number of edges: "+str(len(g.es)))
    # visual_style = {}
    # visual_style["vertex_label"] = g.vs["name"]
    # visual_style["edge_arrow_size"] = 30
    # visual_style["bbox"] = (1500, 1500)
    # layout = g.layout("kk")
    # plot(g, "visualized_subgraph.pdf", **visual_style)
    with open('created_graph.json', 'w') as file_path:
        json.dump(json_temp, file_path)

if __name__ == '__main__':
    main()

