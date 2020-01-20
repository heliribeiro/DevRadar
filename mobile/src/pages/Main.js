import React, {useState,useEffect} from 'react';
import {StyleSheet, Image, View, Text, TextInput, TouchableOpacity} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import {requestPermissionsAsync, getCurrentPositionAsync} from 'expo-location';
import { MaterialIcons} from '@expo/vector-icons';

import api from '../services/api';
import {connect, disconnect, subscribeToNewDevs } from '../services/socket'

function Main ({navigation}) {
   const [devs, setDevs] = useState([])
   const [CurrentRegion, SetCurrentRegion] = useState(null);
   const [techs, setTechs] = useState('');

   useEffect(()=>{
      subscribeToNewDevs(dev => setDevs([...devs,dev]));
   },[devs])


   useEffect(() =>{
      async function loadInitialPosition (){
       const {granted } = await requestPermissionsAsync ();

       if(granted){
          const {coords} = await getCurrentPositionAsync({
             enableHighAccuracy: true,
          });

         const {latitude, longitude} = coords;

         SetCurrentRegion({
            latitude,
            longitude,
            latitudeDelta: 0.04,
            longitudeDelta:0.04,
         })
       }
      }         
      loadInitialPosition();
   },[])

   function setupWebsocket (){
      disconnect();

      const {latitude, longitude} = CurrentRegion;
      connect(
         latitude,
         longitude,
         techs
      );  
   }

   async function loadDevs () {
      const {latitude, longitude} = CurrentRegion;

      const response = await api.get('/search',{
        params:{
           latitude,
           longitude,
           techs
        }
      });
  
      setDevs(response.data.devs);
      setupWebsocket();
   }

   function handleRegionChanged(region) {
      SetCurrentRegion(region);
   }

   if(!CurrentRegion){
      return null;
   }

   return (
      <>
      <MapView onRegionChangeComplete={handleRegionChanged} 
      initialRegion={CurrentRegion} 
      style={styles.map}
      >
         {devs.map(dev => (
            <Marker 
             key={dev._id}
             coordinate={{
               longitude:dev.location.coordinates[0],
               latitude: dev.location.coordinates[1] ,             
            }}
               >
               <Image 
               style={styles.avatar} 
               source={{uri: dev.avatar_url}}
               />
               <Callout onPress={()=>{
                  navigation.navigate('Profile', { 
                     github_username: dev.github_username,
                  });
               }}>
                  <View style={styles.callout}>
                     <Text syle={styles.devName}>{dev.name}</Text>
                     <Text syle={styles.devBio}>{dev.bio}</Text>
                     <Text syle={styles.devTechs}>{dev.techs.join(', ')}</Text>
                  </View>
               </Callout>
            </Marker>
         ))}
      </MapView>
      <View style={styles.searchForm}>
            <TextInput 
            style={styles.searchInput} 
            placeholder= "Buscar devs por techs..."
            placeholderTextColor= '#999'
            autoCapitalize= 'words'
            autoCorrect={false}
            value={techs}
            onChangeText={setTechs}
            />
            <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
               <MaterialIcons name="my-location" size={20} color="#FFF" />
            </TouchableOpacity>
      </View>
      </>
  );
}

const styles = StyleSheet.create({
   map:{
      flex:1,
   },
   avatar: {
      width: 54,
      height: 54,
      borderRadius:4,
      borderWidth:4,
      borderColor: '#FFF'
   },
   callout:{
      width: 260
   },

   devName:{
      fontWeight: 'bold',
      fontSize:16
   },

   devBio:{
      color: '#666',
      marginTop:5
   },

   devTechs:{
      marginTop: 5
   },
   searchForm:{
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      zIndex: 5,
      flexDirection: 'row'
   },
   searchInput:{
      flex: 1,
      height: 50,
      backgroundColor: '#FFF',
      color: '#333',
      borderRadius: 25,
      paddingHorizontal: 20,
      fontSize: 16,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: {
         width: 4,
         height: 4,
      },
      elevation: 4
   },   
   loadButton:{
      width: 50,
      height: 50,
      backgroundColor: '#8E4Dff',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 15
   }

})

export default Main;