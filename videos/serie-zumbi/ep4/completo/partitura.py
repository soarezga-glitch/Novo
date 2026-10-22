# gera partitura-sons.json a partir dos tempos das falas (rodar de novo sempre que o áudio mudar)
import json
P=json.loads(open('legenda-dados.js').read().split('window.PALAVRAS = ',1)[1].split(';\nwindow.SEGMENTOS')[0])
SEG={s['id']:s for s in json.load(open('segmentos.json'))}
def W(i,n): ws=[p for p in P if p['seg']==i]; return ws[min(n,len(ws)-1)]['start']
de=lambda i: SEG[i]['de']; ate=lambda i: SEG[i]['ate']
FIM=ate('P25')+0.35; CART=FIM+0.8; END=CART+3.4
B='../../../../.claude/skills/sons-de-ambiente/biblioteca/'
A=lambda s,a,b,db,fade=0.4: dict(som=s,de=round(a,2),ate=round(b,2),db=db,fade=fade)
E=lambda s,t,db: dict(som=s,em=round(t,2),db=db)
amb=[A('amb_horda',0,3.0,-9,0.1),A('amb_tensao_grave',3.0,de('N02')-0.1,-13),A('amb_natureza',W('N02',6),de('N06'),-14,0.6),A('amb_amanhecer',W('N02',6),de('N06'),-19,0.6),
 A('amb_tensao_grave',W('N03',6),de('N17'),-16,0.6),A('amb_natureza',de('N06'),de('N17'),-19),A('sfx_moscas',W('N06',12),de('N07'),-12),A('amb_noite_fria',de('N08'),de('P04'),-14),
 A('sfx_coracao',W('N08',12),de('P04'),-6,0.2),A('sfx_coracao',de('N09'),ate('N09'),-8),A('amb_tensao_grave',de('N12'),de('N17'),-12),
 A('amb_horda',de('N16'),ate('N19'),-10,0.3),A('sfx_coracao',de('N17'),ate('N19'),-6),A('amb_fuga',de('N17'),ate('N19'),-14),
 A('amb_noite_fria',de('N20'),ate('N21'),-15),A('sfx_coracao',de('P15'),ate('N21'),-8),A('amb_tensao_grave',de('N20'),ate('N21'),-14),
 A('amb_noite',de('N22'),de('N27'),-15),A('sfx_estatica',W('N23',6),ate('N23'),-20,0.2),A('amb_tensao_grave',de('N23'),FIM,-13,0.6),
 A('amb_noite',de('N27'),FIM,-18),A('sfx_coracao',de('N30'),FIM,-5,0.2),A('amb_tensao_grave',CART,END,-16)]
ef=[E('whoosh-cinematic',0.05,-6),E('sfx_impacto_cinema',0.4,0),E('impact-bass-1',0.42,-4),E('sfx_gemido_perto',1.2,-10),E('pop',W('N01',9),-12),E('impact-bass-2',W('N01',12),-8),
 E('sfx_porta_range',W('N02',2),-4),E('sfx_porta_range',W('N02',5),-4),E('whoosh',W('N02',6),-14),E('pop',W('N02',14),-12),E('whoosh-short',de('N03'),-12),E('sfx_capim_mexe',W('N03',6)+1.0,-8),
 E('impact-bass-2',W('N04',0),-8),E('pop',W('N04',11),-12),E('whoosh',de('N05'),-14),E('sfx_ferrao',W('N05',12),-8),E('pop',W('N05',17),-12),E('sfx_porteira_range',de('N06'),-10),
 E('whoosh-short',de('N07'),-14),E('sfx_ferrao',W('N07',8),-8),E('impact-bass-2',W('N07',12),-8),
 E('sfx_baque_madeira',W('N08',2),-6),E('sfx_baque_madeira',W('N08',2)+2.8,-7),E('sfx_clique_grave',W('N08',12),-4),E('sfx_ferrao',W('N08',12)+0.3,-6),
 E('sfx_ferrao',W('N09',0),-4),E('impact-bass-2',W('N09',6),-6),E('sfx_ferrao',W('P06',5),-8),E('whoosh-cinematic',de('P08')-0.2,-10),E('pop',W('N10',6),-12),E('pop',W('N10',12),-12),
 E('sfx_pano',W('N11',0),-12),E('sfx_clique_grave',W('N11',12),-6),E('sfx_panela',W('N12',10),-2),E('sfx_ferrao',W('N12',10)+0.2,-8),
 E('sfx_passo_madeira_1',W('N13',5),-8),E('sfx_passo_madeira_2',W('N13',7),-8),E('sfx_estalo',W('N13',13),-2),
 E('whoosh-short',de('N14'),-12),E('sfx_gemido_perto',W('N14',5),-8),E('sfx_ferrao',W('N14',5),-8),E('sfx_gemido_1',de('N15'),-10),
 E('sfx_baque_madeira',de('N16')+0.1,0),E('sfx_impacto_cinema',de('N16')+0.12,-2),E('sfx_gemido_2',de('N16')+1,-8),E('sfx_gemido_3',de('N16')+2,-8),E('impact-bass-2',W('N16',10),-6),
 E('sfx_gemido_4',de('N17')+1.5,-10),E('sfx_gemido_1',de('N18')+2,-10),E('sfx_ferrao',W('N18',18),-6),E('sfx_pano',W('N19',1),-4),E('impact-bass-2',W('N19',13),-8),
 E('sfx_agua',de('N20')+1.5,-6),E('sfx_agua',de('N20')+2.8,-10),E('sfx_gemido_perto',de('P16')+0.4,-14),E('pop',W('N21',8),-14),E('pop',W('N21',10),-14),
 E('whoosh',de('N22'),-14),E('sfx_porteira_range',W('N22',13),-8),E('sfx_ferrao',W('N22',13)+0.3,-8),E('sfx_porta_range',de('N23')+0.2,-8),E('sfx_ferrao',W('N24',6),-6),
 E('impact-bass-2',W('N25',1),-8),E('sfx_ferrao',W('N25',9),-6),E('sfx_mugido',de('N27')+0.3,-4),E('sfx_mugido',de('N27')+2.6,-6),E('sfx_mugido',de('N28')+1,-10),
 E('impact-bass-2',W('N29',3),-8),E('sfx_ferrao',W('N30',6),-4),E('sfx_porta_range',W('N31',12),-2),E('sfx_mugido',ate('P25')-0.6,-4),E('impact-bass-2',FIM,-4),E('whoosh-cinematic',CART,-8),E('pop',CART+1.0,-12)]
passos=[dict(som='sfx_passo_capim',de=W('N02',6),ate=de('N03'),intervalo=0.5,db=-16),dict(som='sfx_passo_capim',de=de('N06'),ate=de('N06')+2.4,intervalo=0.45,db=-10),
 dict(som='sfx_passo_capim',de=de('N17'),ate=ate('P14'),intervalo=0.28,db=-8),dict(som='sfx_passo_capim',de=W('N19',9),ate=ate('N19'),intervalo=0.28,db=-8),
 dict(som='sfx_passo_madeira',de=de('N26'),ate=ate('N26'),intervalo=0.45,db=-12),dict(som='sfx_passo_capim',de=de('P24'),ate=FIM,intervalo=0.38,db=-12)]
json.dump(dict(duracao=round(END,2),voz='fala_master.wav',biblioteca=[B+x for x in ['apocalipse','hoje','ui','roma','escola']],ambientes=amb,efeitos=ef,passos=passos,ducking=dict(db=6),volume_final_lufs=-10),open('partitura-sons.json','w'),indent=1,ensure_ascii=False)
print('fim',round(END,1))
