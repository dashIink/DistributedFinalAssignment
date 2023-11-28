import hashlib

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
