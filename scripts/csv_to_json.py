import shutil
import pandas as pd
import json
import os

def csv_to_json(input_csv, output_folder):
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)

    minutes = 1440
    # Leer el archivo CSV
    df = pd.read_csv(input_csv, lineterminator='\n')

    # Rellenar los valores faltantes con texto predeterminado
    df.fillna('', inplace=True)

    # Asegurar que la carpeta de salida exista, si no, crearla
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Agrupar por la columna 'time' y crear archivos JSON para cada grupo
    for key, group in df.groupby('Time'):
        # Convertir el DataFrame del grupo a una lista de diccionarios
        data = []
        for _, row in group.iterrows():
            # Dividir la cita basada en Quote time
            quote_parts = row['Quote'].split(row['Quote time'], 1)
            quote_first = quote_parts[0]
            quote_last = quote_parts[1]

            # Construir el diccionario de datos
            entry = {
                'time': row['Time'],
                'quote_first': quote_first,
                'quote_last': quote_last,
                'quote_time_case': row['Quote time'],
                'quote_raw': row['Quote'],
                'title': row['Title'],
                'author': row['Author'],
                'sfw': row['SFW']
            }
            data.append(entry)

        # Crear el nombre del archivo JSON
        json_filename = os.path.join(output_folder, f'{key.replace(":", "_")}.json')

        # Escribir los datos en el archivo JSON
        with open(json_filename, 'w') as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

    # print(df.sort_values(['Quote']).groupby('Author')['Quote'].nunique())

     # Cantidad de horas con citas
    times_with_quote = df.groupby('Time')['Time'].nunique().sum()

    # Estadísticas para los 5 horarios con menos citas
    bottom_time_quotes = df.groupby('Time').size().nsmallest(5)

    # Estadísticas para los 5 horarios con más citas
    top_time_quotes = df.groupby('Time').size().nlargest(5)

    # Estadísticas para los 5 autores con más citas
    top_author_quotes = df.groupby('Author').size().nlargest(5)
    
    statistics = {
        'times_with_quotes': times_with_quote,
        'times_without_quotes': minutes - times_with_quote,
        'total': minutes,
        'progress': round((times_with_quote * 100) / minutes, 2),
        'top_author_quotes': top_author_quotes.to_dict(),
        'bottom_time_quotes': bottom_time_quotes.to_dict(),
        'top_time_quotes': top_time_quotes.to_dict()
    }

    print('Statistics:', json.dumps(statistics, indent=4, default=int, ensure_ascii=False))

    with open('statistics.json', 'w') as json_file:
        json.dump(statistics, json_file, indent=4, default=int, ensure_ascii=False)

# Ruta al archivo CSV de entrada
input_csv = 'quotes.csv'

# Carpeta de salida para los archivos JSON
output_folder = '../times'

# Llamar a la función para convertir CSV a JSON
csv_to_json(input_csv, output_folder)