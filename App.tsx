import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Condicional pro Mapa (só importa se não for web)
let MapView: any, Marker: any, Location: any;
if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
  Location = require('expo-location').default;
}

// Tipos de dados
type Servico = {
  id: string;
  nome: string;
  tipo: 'domicilio' | 'calçada';
  descricao: string;
  preco: number;
  distancia: number;
  latitude: number;
  longitude: number;
};

type Props = { navigation: any };

// Tela Home: Busca, Filtros e Mapa
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bairro, setBairro] = useState('');
  const [raio, setRaio] = useState('1km');
  const [tipo, setTipo] = useState<'domicilio' | 'calçada'>('domicilio');
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const servicos: Servico[] = [
    { id: '1', nome: 'Encanador Domicílio', tipo: 'domicilio', descricao: 'Reparo em vazamentos internos', preco: 150, distancia: 500, latitude: -23.5505, longitude: -46.6333 },
    { id: '2', nome: 'Varredor Calçada', tipo: 'calçada', descricao: 'Limpeza de rua pós-chuva', preco: 80, distancia: 200, latitude: -23.5614, longitude: -46.6569 },
    { id: '3', nome: 'Jardineiro Calçada', tipo: 'calçada', descricao: 'Poda de árvores urbanas', preco: 120, distancia: 800, latitude: -23.5505, longitude: -46.6333 },
    { id: '4', nome: 'Pintor de Muros', tipo: 'calçada', descricao: 'Revitalização de fachadas externas', preco: 250, distancia: 300, latitude: -23.5614, longitude: -46.6569 },
    { id: '5', nome: 'Eletricista Domicílio', tipo: 'domicilio', descricao: 'Instalação de tomadas', preco: 200, distancia: 600, latitude: -23.5505, longitude: -46.6333 },
  ];

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getLocation();
    } else {
      setErrorMsg('Mapa e localização disponíveis só no device. Use Expo Go!');
    }
  }, []);

  const getLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setErrorMsg('Permissão de localização negada');
        return;
      }
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão de localização negada');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(loc);
  };

  const filtrarServicos = (): Servico[] => {
    return servicos.filter(s => 
      s.tipo === tipo && 
      (!bairro || s.descricao.toLowerCase().includes(bairro.toLowerCase())) &&
      s.distancia <= (raio === '1km' ? 1000 : raio === '2km' ? 2000 : 5000)
    );
  };

  const agendar = (servico: Servico) => {
    Alert.alert('Agendar', `Agendar ${servico.nome} por R$${servico.preco}?`, [
      { text: 'Cancelar' },
      { text: 'Sim', onPress: () => navigation.navigate('Agendamento', { servico }) }
    ]);
  };

  const filteredServicos = filtrarServicos();

  // Toggle customizado
  const toggleTipo = () => {
    setTipo(tipo === 'domicilio' ? 'calçada' : 'domicilio');
  };

  const initialRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendador SP - Serviços Locais</Text>
      
      {/* Filtros */}
      <TextInput
        style={styles.input}
        placeholder="Digite o bairro (ex: Moema)"
        value={bairro}
        onChangeText={setBairro}
      />
      <TextInput
        style={styles.input}
        placeholder="Raio de busca"
        value={raio}
        onChangeText={setRaio}
      />
      
      {/* Toggle Customizado */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, tipo === 'domicilio' && styles.toggleActive]}
          onPress={toggleTipo}
        >
          <Text style={styles.toggleText}>Domicílio</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, tipo === 'calçada' && styles.toggleActive]}
          onPress={toggleTipo}
        >
          <Text style={styles.toggleText}>Calçada</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Localização */}
      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <Text style={styles.locationText}>Minha Localização</Text>
      </TouchableOpacity>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* Mapa (só no device) */}
      {Platform.OS === 'web' ? (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>Mapa disponível no device (Expo Go). Pins mostram serviços próximos!</Text>
        </View>
      ) : (
        <MapView style={styles.map} initialRegion={initialRegion}>
          {filteredServicos.map(servico => (
            <Marker
              key={servico.id}
              coordinate={{ latitude: servico.latitude, longitude: servico.longitude }}
              title={servico.nome}
              description={servico.descricao}
              pinColor={servico.tipo === 'calçada' ? 'green' : 'blue'}
            />
          ))}
        </MapView>
      )}

      {/* Lista Filtrada */}
      <FlatList
        data={filteredServicos || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <TouchableOpacity style={styles.card} onPress={() => agendar(item)}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text>{item.descricao}</Text>
              <Text>R$ {item.preco} - {item.distancia}m de distância</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço encontrado. Tente ajustar os filtros!</Text>}
      />
    </View>
  );
};

// Tela Agendamento
const AgendamentoScreen: React.FC<Props> = ({ route }) => {
  const { servico } = route.params as { servico: Servico } || {};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendando {servico?.nome || 'Serviço'}</Text>
      <Text>Preço: R$ {servico?.preco || 0}</Text>
      <TouchableOpacity style={styles.button}>
        <Text>Confirmar via WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Busca de Serviços' }} />
        <Stack.Screen name="Agendamento" component={AgendamentoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f0f1' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  toggleContainer: { flexDirection: 'row', marginBottom: 20 },
  toggleButton: { flex: 1, padding: 10, backgroundColor: '#ddd', borderRadius: 5, alignItems: 'center', marginHorizontal: 5 },
  toggleActive: { backgroundColor: '#25D366' },
  toggleText: { color: '#333', fontWeight: 'bold' },
  locationButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  locationText: { color: 'white', fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  map: { height: 200, marginBottom: 20 },
  mapPlaceholder: { height: 200, marginBottom: 20, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 5 },
  placeholderText: { textAlign: 'center', color: '#666', padding: 10 },
  card: { backgroundColor: 'white', padding: 15, marginVertical: 5, borderRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  button: { backgroundColor: '#25D366', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
});
