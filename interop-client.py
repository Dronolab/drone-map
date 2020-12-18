from interop.client.auvsi_suas.client import client
#from interop.client.auvsi_suas.proto import interop_api_pb2

client = client.Client(url='http://127.0.0.1:8000',
                       username='testuser',
                       password='testpass')

teams = client.get_teams()
print(teams)