# gera partitura-sons.json a partir dos tempos das falas (rodar de novo sempre que o áudio mudar)
# trilha de ROCK nas cenas do Dimas; corte seco no "silêncio" (o virote crava)
import json
P=json.loads(open('legenda-dados.js').read().split('window.PALAVRAS = ',1)[1].split(';\nwindow.SEGMENTOS')[0])
SEG={s['id']:s for s in json.load(open('segmentos.json'))}
def W(i,n): ws=[p for p in P if p['seg']==i]; return ws[min(n,len(ws)-1)]['start']
de=lambda i: SEG[i]['de']; ate=lambda i: SEG[i]['ate']
FIM=ate('P09')+0.35; CART=FIM+0.8; END=CART+3.6
T_GOLPE=W('N07',16)+0.1; T_CRAVA=W('N16',18)+0.05; T_VOA0=W('N16',16)-0.1; T_CAI=W('N17',4); T_PORT=W('N15',13); T_FACAO=W('N18',14); T_DESCE=W('N18',11); T_SAI=de('P02')+0.2
# inícios dos planos (iguais aos da cena)
cidade=de('N03')-0.1; motoF=de('N04')-0.1; motoL=W('N04',11)-0.1; dimas=de('N06')-0.1; onibus=de('P02')-0.3; tanque=de('N08')-0.1; ponte=W('N08',6)-0.1; terra=de('P03')-0.2
estrada=de('N09')-0.1; flashV=W('N09',6)-0.05; volta=de('N10')-0.1; colo=W('N11',9)-0.1; olhaP=de('N12')-0.1; menina=W('N12',14)-0.1; avanca=W('N13',0)-0.1
estrada2=de('N14')-0.1; dois=de('N16')-0.1; desce=W('N18',8)-0.1; quem=de('P07')-0.2; perna=W('N19',7)-0.1
B='../../../.claude/skills/sons-de-ambiente/biblioteca/'
A=lambda s,a,b,db,fade=0.4: dict(som=s,de=round(a,2),ate=round(b,2),db=db,fade=fade)
E=lambda s,t,db: dict(som=s,em=round(t,2),db=db)
amb=[A('amb_horda',0,4.0,-9,0.1),A('amb_noite',4.0,cidade,-20),A('amb_tensao_grave',de('N02')-0.2,cidade,-12),A('sfx_coracao',W('N02',15),cidade-0.2,-8,0.3),
 # cidade + rock
 A('trilha_rock',cidade+0.2,volta,-7,0.6),A('amb_cidade_caos',cidade,tanque,-20),A('sfx_moto_andando',motoF,dimas,-9,0.3),A('sfx_moto_lenta',dimas,tanque,-11,0.3),
 A('amb_horda',ponte,estrada,-10,0.3),A('sfx_moto_lenta',terra,estrada,-13),A('sfx_moto_andando',estrada,flashV,-10,0.3),A('amb_festa_longe',flashV,volta,-20,0.3),
 # curral
 A('amb_sitio_noite',volta,estrada2,-19),A('amb_tensao_grave',volta,estrada2,-11,0.6),A('sfx_coracao',W('N11',4),colo,-7),A('sfx_coracao',avanca,estrada2,-5),
 # estrada lá embaixo + rock de novo até o virote cravar (silêncio)
 A('trilha_rock',estrada2+0.1,T_CRAVA,-6,0.4),A('sfx_moto_lenta',estrada2,W('N15',1),-11,0.3),A('sfx_moto_andando',W('N15',1),T_PORT+1.2,-7,0.2),
 A('amb_tensao_grave',dois,T_CRAVA,-10,0.3),A('sfx_coracao',dois,T_CRAVA,-3,0.2),
 # depois do silêncio
 A('amb_sitio_noite',de('N17')+0.6,FIM,-21,1.2),A('amb_tensao_grave',desce,FIM,-14,1.0),A('trilha_rock',desce+0.4,FIM,-15,1.2),A('sfx_coracao',perna,FIM,-7),
 A('amb_tensao_grave',CART,END,-16)]
ef=[E('whoosh-cinematic',0.05,-6),E('sfx_impacto_cinema',0.4,0),E('impact-bass-1',0.42,-4),E('sfx_gemido_perto',1.4,-10),E('whoosh-short',W('N01',5),-10),E('impact-bass-2',W('N01',6),-8),
 E('sfx_mugido',de('P01')-0.6,-14),E('sfx_capim_mexe',W('N02',15),-4),E('sfx_capim_mexe',W('N02',19),-6),E('sfx_gemido_perto',W('N02',21),-6),E('sfx_ferrao',W('N02',21),-8),
 E('whoosh-cinematic',cidade-0.1,-8),E('pop',W('N03',3),-12),E('impact-bass-2',W('N03',7),-8),E('sfx_moto_acelera',motoF+0.1,-3),E('sfx_moto_passa',motoL,-4),
 E('whoosh',W('N05',0)-0.1,-12),E('pop',W('N05',0),-12),E('sfx_clique_grave',W('N05',5),-8),E('pop',W('N05',5),-12),E('pop',W('N05',13),-12),
 E('sfx_moto_acelera',dimas,-6),E('impact-bass-1',W('N06',4),-4),E('whoosh-short',W('N06',7),-12),
 E('sfx_gemido_1',T_SAI+0.4,-6),E('sfx_gemido_2',W('N07',2),-6),E('sfx_gemido_perto',W('N07',10),-6),E('whoosh-short',T_GOLPE-0.14,-4),E('sfx_golpe_cabeca',T_GOLPE,0),E('impact-bass-2',T_GOLPE,-2),
 E('sfx_baque_madeira',T_GOLPE+0.6,-6),
 E('sfx_clique',tanque+0.2,-8),E('sfx_ferrao',W('N08',4),-8),E('sfx_gemido_3',ponte+0.4,-8),E('sfx_gemido_4',ponte+1.6,-10),E('impact-bass-2',W('N08',14),-6),
 E('sfx_moto_acelera',estrada,-6),E('sfx_sopro_reverso',flashV-0.3,-8),E('sfx_gemido_1',flashV+0.6,-12),
 E('whoosh-cinematic',volta-0.1,-10),E('sfx_mugido',volta+0.4,-10),E('sfx_ferrao',W('N10',11),-6),E('sfx_gemido_perto',W('N10',13),-4),
 E('sfx_ferrao',W('N11',4),-8),E('sfx_sopro_reverso',colo-0.3,-8),E('sfx_sopro_reverso',olhaP-0.3,-10),E('sfx_gemido_2',W('N12',8),-8),E('sfx_porteira_range',menina+0.2,-10),
 E('sfx_passo_madeira_1',menina+0.5,-14),E('sfx_passo_madeira_2',menina+1.0,-14),E('impact-bass-2',de('P06'),-6),
 E('sfx_ferrao',W('N13',0),-4),E('sfx_gemido_perto',W('N13',5),-2),E('sfx_mugido',W('N13',7),-8),
 E('sfx_grito_menina',W('N14',8)-0.2,-2),E('pop',W('N14',9),-12),E('sfx_moto_acelera',W('N15',1),0),E('sfx_mataburro',W('N15',8)-0.1,0),E('impact-bass-1',W('N15',8),-4),
 E('sfx_porteira_quebra',T_PORT,0),E('sfx_impacto_cinema',T_PORT,-4),E('sfx_moto_passa',T_PORT+0.2,-6),
 E('sfx_gemido_perto',W('N16',9),-6),E('sfx_besta',T_VOA0,0),E('whoosh',T_VOA0+0.05,-4),E('sfx_crava',T_CRAVA,0),E('impact-bass-1',T_CRAVA,-1),
 E('sfx_cai_capim',T_CAI+0.4,-2),E('sfx_baque_madeira',T_CAI+0.45,-8),
 E('sfx_baque_madeira',W('N18',4)+0.4,-10),E('sfx_moto_lenta',desce,-14),E('whoosh-short',T_FACAO,-6),E('sfx_clique_grave',T_FACAO+0.25,-4),
 E('impact-bass-2',W('N19',7),-8),E('sfx_ferrao',W('N19',15),-6),E('impact-bass-1',W('P09',4),-6),E('impact-bass-2',FIM,-4),E('whoosh-cinematic',CART,-8),E('pop',CART+1.0,-12)]
passos=[dict(som='sfx_passo_capim',de=W('N01',7),ate=de('P01')-0.3,intervalo=0.42,db=-12),dict(som='sfx_passo_capim',de=W('N13',5),ate=W('N13',9),intervalo=0.2,db=-6),
 dict(som='sfx_passo_capim',de=dois,ate=W('N16',9),intervalo=0.5,db=-8),dict(som='sfx_passo_madeira',de=T_DESCE,ate=T_DESCE+1.0,intervalo=0.45,db=-10)]
json.dump(dict(duracao=round(END,2),voz='fala_master.wav',biblioteca=[B+x for x in ['apocalipse','hoje','ui','roma','escola']],ambientes=amb,efeitos=ef,passos=passos,ducking=dict(db=6),volume_final_lufs=-10),open('partitura-sons.json','w'),indent=1,ensure_ascii=False)
print('fim',round(END,1))
