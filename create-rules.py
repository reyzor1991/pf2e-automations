import json
from os import walk

rule_config = json.load(open(f'files/config.json', encoding='utf8'))
version = {}
version['version'] = rule_config['version']

for (dirpath, dirnames, filenames) in walk('rule-groups'):
    for filename in filenames:
        if 'json' not in filename:
            continue
        f_rule = json.load(open(f'{dirpath}/{filename}', encoding='utf-8'))
        rule_config['groups'].append(f_rule)

with open("dist/rules/config.json", "w", encoding='utf-8') as outfile:
    outfile.write(json.dumps(rule_config, indent=2))

with open("dist/rules/version.json", "w", encoding='utf-8') as outfile:
    outfile.write(json.dumps(version, indent=2))