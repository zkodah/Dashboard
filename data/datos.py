try:
	import pandas as pd
	_HAS_PANDAS = True
except Exception:
	_HAS_PANDAS = False

import os
import csv

INPUT = "data.csv"
OUTPUT = "data_modificado.csv"
MIN_VAL = 0
MAX_VAL = 2500

if _HAS_PANDAS:
	df = pd.read_csv(INPUT)
	if "cantidad" in df.columns:
		df["cantidad"] = df["cantidad"].clip(MIN_VAL, MAX_VAL)
	else:
		print("Advertencia: columna 'cantidad' no encontrada en el CSV.")
	df.to_csv(OUTPUT, index=False)
	print(f"Archivo modificado y guardado como {OUTPUT}")
else:
	print("Aviso: 'pandas' no está instalado. Usando fallback con el módulo 'csv'.")
	try:
		with open(INPUT, newline='', encoding='utf-8') as f_in:
			reader = csv.DictReader(f_in)
			fieldnames = reader.fieldnames or []
			rows = []
			for r in reader:
				if 'cantidad' in r:
					try:
						val = float(r['cantidad'])
						if val != val:  # NaN check
							# leave as-is
							clipped = r['cantidad']
						else:
							clipped = max(MIN_VAL, min(MAX_VAL, val))
							if isinstance(clipped, float) and clipped.is_integer():
								clipped = int(clipped)
					except Exception:
						clipped = r['cantidad']
					r['cantidad'] = clipped
				rows.append(r)
		with open(OUTPUT, 'w', newline='', encoding='utf-8') as f_out:
			writer = csv.DictWriter(f_out, fieldnames=fieldnames)
			writer.writeheader()
			writer.writerows(rows)
		print(f"Archivo modificado y guardado como {OUTPUT} (fallback)")
		print("Para usar pandas y funciones más rápidas, instala pandas:")
		print("    python -m pip install pandas")
	except FileNotFoundError:
		print(f"Archivo de entrada no encontrado: {INPUT}")