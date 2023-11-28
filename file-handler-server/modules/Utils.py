import hashlib
from typing import Dict, Iterator, List, Tuple

def hash_file(file_path, hash_type="sha256"):
    """
    Hash a file using a specified hash function (default is SHA-256).
    
    :param file_path: str - The path to the file.
    :param hash_type: str - The type of the hash function to use (e.g., "sha256", "md5").
    :return: str - The hexadecimal hash of the file.
    """

    # Supported hash functions
    supported_hashes = {
        'md5': hashlib.md5,
        'sha1': hashlib.sha1,
        'sha224': hashlib.sha224,
        'sha256': hashlib.sha256,
        'sha384': hashlib.sha384,
        'sha512': hashlib.sha512
    }

    # Check if the requested hash function is supported
    if hash_type not in supported_hashes:
        raise ValueError(f"Unsupported hash type: {hash_type}. Supported types are: {', '.join(supported_hashes.keys())}")
    
    hash_func = supported_hashes[hash_type]()

    try:
        # Open the file in binary mode and hash it in chunks to support large files
        with open(file_path, 'rb') as file:
            for chunk in iter(lambda: file.read(4096), b""):
                hash_func.update(chunk)
    except FileNotFoundError:
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    except IOError as e:
        # Handle other possible I/O errors
        raise IOError(f"An I/O error occurred: {e.strerror}")

    # Return the hexadecimal digest of the hash
    return hash_func.hexdigest()


import itertools

def distribute_chunks_with_sequence(chunks, grpc_strings) -> Dict[str, List[Tuple[int, str]]]:
    """
    Distributes chunks to the strings returned by a gRPC call as evenly as possible
    and includes the sequence number for each chunk.
    
    :param chunks: List of string chunks.
    :param grpc_strings: List of strings returned from the gRPC call.
    :return: Dictionary with gRPC strings as keys and lists of tuples (chunk, sequence) as values.
    """
    if not grpc_strings:
        raise ValueError("No strings returned from gRPC to distribute the chunks.")
    
    # Calculate the number of chunks per gRPC string
    chunks_per_string = len(chunks) // len(grpc_strings)
    extra_chunks = len(chunks) % len(grpc_strings)

    # Create an iterator for the chunks with sequence numbers
    chunks_iter = iter(enumerate(chunks))

    # Distribute chunks as evenly as possible
    distribution = {}
    for grpc_string in grpc_strings:
        # Assign each gRPC string its calculated number of chunks
        distribution[grpc_string] = [next(chunks_iter) for _ in range(chunks_per_string)]
        
        # Distribute the extra chunks one by one to the first gRPC strings
        if extra_chunks > 0:
            distribution[grpc_string].append(next(chunks_iter))
            extra_chunks -= 1

    return distribution


from itertools import cycle, islice

def even_chunk_iterator(distribution) -> Iterator[Tuple[str, Tuple[int, str]]]:
    """
    Creates an iterator that cycles through the gRPC strings evenly, yielding
    (grpc_string, (sequence_num, chunk)) pairs one by one.
    
    :param distribution: Dictionary with gRPC strings as keys and lists of tuples (sequence, chunk) as values.
    :return: Iterator of tuples (grpc_string, (sequence_num, chunk)).
    """
    # Create an iterator that cycles through the gRPC strings
    grpc_cycle = cycle(distribution.items())

    # Calculate the total number of chunks
    total_chunks = sum(len(chunks) for chunks in distribution.values())

    # Create an iterator that cycles through each gRPC string and yields the next chunk
    even_iterator = (
        (grpc_string, chunk) 
        for grpc_string, chunks in grpc_cycle 
        for chunk in islice(chunks, 1)  # Take one chunk from the current gRPC string
    )

    # Use islice to limit the iterator to the total number of chunks
    return islice(even_iterator, total_chunks)

