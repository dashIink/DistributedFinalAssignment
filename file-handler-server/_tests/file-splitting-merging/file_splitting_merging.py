import os
import sys
import shutil

def reassemble_file(input_directory, output_file, num_segments):
    with open(output_file, 'wb') as outfile:
        for i in range(num_segments):
            segment_name = f"segment_{i + 1}.dat"
            segment_path = os.path.join(input_directory, segment_name)

            with open(segment_path, 'rb') as infile:
                shutil.copyfileobj(infile, outfile)

def split_file(input_file, output_directory, num_segments):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    with open(input_file, 'rb') as infile:
        file_size = os.path.getsize(input_file)
        segment_size = file_size // num_segments

        for i in range(num_segments):
            segment_name = f"segment_{i + 1}.dat"
            output_path = os.path.join(output_directory, segment_name)

            with open(output_path, 'wb') as outfile:
                remaining_size = file_size - (i * segment_size)
                current_segment_size = min(segment_size, remaining_size)
                data = infile.read(current_segment_size)
                outfile.write(data)

def main():
    if len(sys.argv) != 5:
        print("Usage: python file_splitting_merging.py [split | assemble] input_file output_directory_or_file num_segments")
        sys.exit(1)

    action = sys.argv[1]
    input_file = sys.argv[2]
    output_path = sys.argv[3]
    num_segments = int(sys.argv[4])

    if action == "split":
        split_file(input_file, output_path, num_segments)
        print(f"File '{input_file}' has been split into {num_segments} segments in '{output_path}'")
    elif action == "assemble":
        reassemble_file(input_file, output_path, num_segments)
        print(f"{num_segments} segments in '{input_file}' have been reassembled into '{output_path}'")
    else:
        print("Invalid action. Use 'split' or 'assemble'.")

if __name__ == "__main__":
    main()
