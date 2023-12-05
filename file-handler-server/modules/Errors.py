
class MetadataServiceError(Exception):
    PREFIX = "MetadataServiceError: "

    def __init__(self, message):
        self.message = f"{MetadataServiceError.PREFIX}{message}"

    def __str__(self):
        return      self.message
    
class DatastoreServiceError(Exception):
    PREFIX = "DatastoreServiceError: "

    def __init__(self, message):
        self.message = f"{DatastoreServiceError.PREFIX}{message}"

    def __str__(self):
        return self.message