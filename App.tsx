import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Tipos de dados
type Servico = {
  id: string;
  nome: string;
  tipo: 'domicilio' | 'calçada';
  descricao: string;
  preco: number;
  distancia: number;
};

type Props = { navigation: any };

// Tela Home: Busca e Filtros
const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [bairro, setBairro] = useState('');
  const [raio, setRaio] = useState('1km');
  const [tipo, setTipo] = useState<'domicilio' | 'calçada'>('domicilio');

  const servicos: Servico[] = [
    { id: '1', nome: 'Encanador Domicílio', tipo: 'domicilio', descricao: 'Reparo em vazamentos internos', preco: 150, distancia: 500 },
    { id: '2', nome: 'Varredor Calçada', tipo: 'calçada', descricao: 'Limpeza de rua pós-chuva', preco: 80, distancia: 200 },
    { id: '3', nome: 'Jardineiro Calçada', tipo: 'calçada', descricao: 'Poda de árvores urbanas', preco: 120, distancia: 800 },
    { id: '4', nome: 'Pintor de Muros', tipo: 'calçada', descricao: 'Revitalização de fachadas externas', preco: 250, distancia: 300 },
    { id: '5', nome: 'Eletricista Domicílio', tipo: 'domicilio', descricao: 'Instalação de tomadas', preco: 200, distancia: 600 },
  ];

  const filtrarServicos = (): Servico[] => {
    const filtered = servicos.filter(s => 
      s.tipo === tipo && 
      (!bairro || s.descricao.toLowerCase().includes(bairro.toLowerCase())) &&
      s.distancia <= (raio === '1km' ? 1000 : raio === '2km' ? 2000 : 5000)
    );
    return filtered; // Sempre retorna array, mesmo vazio
  };

  const agendar = (servico: Servico) => {
    Alert.alert('Agendar', `Agendar ${servico.nome} por R$${servico.preco}?`, [
      { text: 'Cancelar' },
      { text: 'Sim', onPress: () => navigation.navigate('Agendamento', { servico }) }
    ]);
  };

  const filteredServicos = filtrarServicos(); // Calcula uma vez pra evitar re-renders desnecessários

  // Toggle customizado pro filtro (substitui Picker)
  const toggleTipo = () => {
    setTipo(tipo === 'domicilio' ? 'calçada' : 'domicilio');
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
      
      {/* Toggle Customizado para Tipo de Serviço */}
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

      {/* Lista Filtrada */}
      <FlatList
        data={filteredServicos || []} // Garante array vazio se undefined
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (!item) return null; // Protege contra item undefined
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
  card: { backgroundColor: 'white', padding: 15, marginVertical: 5, borderRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  button: { backgroundColor: '#25D366', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 20 },
});