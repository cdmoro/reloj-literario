import shutil
import pandas as pd
import json
import os

def csv_to_json(input_csv, output_folder):
    shutil.rmtree(output_folder)

    minutes = 1440
    # Contador de citas
    quotes = 0
    # Leer el archivo CSV
    df = pd.read_csv(input_csv, header=None, names=['time', 'quote_time', 'quote', 'title', 'author', 'sfw'])

    # Rellenar los valores faltantes con texto predeterminado
    df.fillna('', inplace=True)

    # Asegurar que la carpeta de salida exista, si no, crearla
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Agrupar por la columna 'time' y crear archivos JSON para cada grupo
    for key, group in df.groupby('time'):
        # Convertir el DataFrame del grupo a una lista de diccionarios
        data = []
        for index, row in group.iterrows():
            # Verificar si quote está vacío
            if row['quote_time'] == '':
                continue  # Saltar esta iteración si quote está vacío
            
            # Dividir la cita basada en quote_time
            quote_parts = row['quote'].split(row['quote_time'])
            quote_first = quote_parts[0]
            quote_last = quote_parts[1]

            # Construir el diccionario de datos
            entry = {
                'time': row['time'].replace("_", ":"),
                'quote_first': quote_first,
                'quote_last': quote_last,
                'quote_time_case': row['quote_time'],
                'title': row['title'],
                'author': row['author'],
                'sfw': row['sfw']
            }
            data.append(entry)
        
        if (len(data)):
            quotes += 1

        # Crear el nombre del archivo JSON
        json_filename = os.path.join(output_folder, f"{key}.json")

        # Escribir los datos en el archivo JSON
        with open(json_filename, 'w') as json_file:
            json.dump(data, json_file, indent=4)

    with open('statistics.json', 'w') as json_file:
        json.dump({
                'quotes': quotes,
                'total': minutes,
                'missing_quotes': minutes - quotes,
                'progress': round((quotes * 100) / minutes, 2)
            }, json_file, indent=4)

# Ruta al archivo CSV de entrada
input_csv = 'quotes.csv'

# Carpeta de salida para los archivos JSON
output_folder = '../times'

# Llamar a la función para convertir CSV a JSON
csv_to_json(input_csv, output_folder)