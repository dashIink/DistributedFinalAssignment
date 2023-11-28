import os
import shutil

def reassemble_file(file_id, input_directory, output_file, num_segments):
    with open(output_file, 'wb') as outfile:
        for i in range(num_segments):
            segment_name = f"{file_id}_segment_{i + 1}.dat"
            segment_path = os.path.join(input_directory, segment_name)
            print(f"segment_path={segment_path}")
            with open(segment_path, 'rb') as infile:
                shutil.copyfileobj(infile, outfile)

def split_file(input_file, output_directory, num_segments):
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)
    with open(input_file, 'rb') as infile:
        file_size = os.path.getsize(input_file)
        segment_size = file_size // num_segments
        for i in range(num_segments):
            file_name = os.path.split(input_file)[-1]
            segment_name = f"{file_name}_segment_{i + 1}.dat"
            output_path = os.path.join(output_directory, segment_name)
            with open(output_path, 'wb') as outfile:
                remaining_size = file_size - (i * segment_size)
                current_segment_size = min(segment_size, remaining_size)
                data = infile.read(current_segment_size)
                outfile.write(data)